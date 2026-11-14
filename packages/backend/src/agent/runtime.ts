// ============================================================
// Aary's IDE — Central Agent Runtime
// THE core orchestrator that powers the entire application
// ============================================================

import type { AgentSession, AgentMessage, AgentState, AIMessage } from '@aarys-ide/shared';
import { generateId } from '@aarys-ide/shared';
import { routeCompletion, routeStream } from '../ai/router.js';
import { getToolsForAI, executeTool } from '../tools/registry.js';
import { getRelevantContext } from '../memory/search.js';
import { createMemory } from '../memory/store.js';
import { appendMessage, getWorkingMemory, setWorkingMemory } from '../memory/working.js';
import { db } from '../database.js';

// Import tools to register them
import '../tools/filesystem.js';
import '../tools/terminal.js';
import '../tools/git.js';
import '../tools/browser.js';
import '../tools/computer-use.js';
import '../tools/file-gen.js';

const sessions = new Map<string, AgentSession>();

const SYSTEM_PROMPT = `You are Aary's IDE Agent — a universal AI assistant that can execute real tasks across devices and workspaces.

You have access to tools for:
- Reading/writing files and directories
- Executing terminal commands
- Git operations (init, add, commit, push, branch, etc.)
- Browser interaction (open URLs, search)
- Screenshot capture and computer observation
- Code and project generation

RULES:
1. Always use tools to accomplish tasks — don't just describe what you'd do.
2. Verify results after execution (check files exist, commands succeeded, etc.)
3. Report what actually happened, not what should have happened.
4. If you encounter an error, diagnose it and try an alternative approach.
5. Ask for clarification only when the request is genuinely ambiguous.
6. Never expose API keys, passwords, or sensitive data.
7. Request approval before destructive operations (deleting files, force push, etc.).`;

export function createSession(userId: string, deviceId?: string, workspaceId?: string): AgentSession {
  const session: AgentSession = {
    id: generateId(),
    userId,
    state: 'idle',
    messages: [],
    deviceId,
    workspaceId,
    capabilities: {
      coding: true, browser: true, computerUse: true,
      fileGeneration: true, terminal: true, git: true, speech: false, vision: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);

  // Persist to DB
  db.prepare(`INSERT INTO conversations (id, user_id, title, messages, device_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(session.id, userId, 'New Conversation', '[]', deviceId || null, session.createdAt, session.updatedAt);

  return session;
}

export function getSession(sessionId: string): AgentSession | null {
  // Check in-memory first
  if (sessions.has(sessionId)) return sessions.get(sessionId)!;

  // Load from DB
  const row = db.prepare('SELECT * FROM conversations WHERE id = ?').get(sessionId) as any;
  if (!row) return null;

  const session: AgentSession = {
    id: row.id, userId: row.user_id, state: 'idle',
    messages: JSON.parse(row.messages || '[]'),
    deviceId: row.device_id, capabilities: {
      coding: true, browser: true, computerUse: true,
      fileGeneration: true, terminal: true, git: true, speech: false, vision: false,
    },
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
  sessions.set(session.id, session);
  return session;
}

export function listSessions(userId: string): Array<{ id: string; title: string; updatedAt: string }> {
  return (db.prepare('SELECT id, title, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50').all(userId) as any[])
    .map(r => ({ id: r.id, title: r.title, updatedAt: r.updated_at }));
}

function updateSessionState(session: AgentSession, state: AgentState) {
  session.state = state;
  session.updatedAt = new Date().toISOString();
}

function persistSession(session: AgentSession) {
  // Extract title from first user message
  const firstUserMsg = session.messages.find(m => m.role === 'user');
  const title = firstUserMsg ? (typeof firstUserMsg.content === 'string' ? firstUserMsg.content : 'Conversation').slice(0, 100) : 'New Conversation';

  db.prepare('UPDATE conversations SET title = ?, messages = ?, updated_at = ? WHERE id = ?')
    .run(title, JSON.stringify(session.messages), session.updatedAt, session.id);
}

/**
 * Process a user message through the agent pipeline:
 * 1. Add to conversation
 * 2. Retrieve relevant memory
 * 3. Build context
 * 4. Send to AI with tools
 * 5. Execute tool calls in a loop
 * 6. Return final response
 */
export async function processMessage(
  sessionId: string,
  content: string,
  onStateChange?: (state: AgentState) => void,
  onStreamChunk?: (chunk: string) => void
): Promise<AgentMessage> {
  const session = getSession(sessionId);
  if (!session) throw new Error('Session not found');

  // 1. Add user message
  const userMessage: AgentMessage = {
    id: generateId(), role: 'user', content, timestamp: new Date().toISOString(),
  };
  session.messages.push(userMessage);
  updateSessionState(session, 'thinking');
  onStateChange?.('thinking');

  // 2. Retrieve relevant memory
  const memoryContext = getRelevantContext(session.userId, content);

  // 3. Build AI messages
  const aiMessages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + (memoryContext ? `\n\nRelevant context from memory:\n${memoryContext}` : '') },
    ...session.messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'tool',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      toolCallId: m.toolResults?.[0]?.toolCallId,
      toolCalls: m.toolCalls?.map(tc => ({
        id: tc.id, type: 'function' as const,
        function: { name: tc.name, arguments: JSON.stringify(tc.args) },
      })),
    })),
  ];

  // 4. Get available tools
  const tools = getToolsForAI();

  // 5. Agent loop — execute until no more tool calls
  let maxIterations = 10;
  let assistantContent = '';

  while (maxIterations-- > 0) {
    updateSessionState(session, 'executing');
    onStateChange?.('executing');

    try {
      const response = await routeCompletion(session.userId, {
        model: '', // Router will select
        messages: aiMessages,
        tools: tools.length > 0 ? tools : undefined,
      }, session.providerId);

      if (response.toolCalls && response.toolCalls.length > 0) {
        // Add assistant message with tool calls
        const assistantMsg: AgentMessage = {
          id: generateId(), role: 'assistant',
          content: response.content || '',
          timestamp: new Date().toISOString(),
          toolCalls: response.toolCalls.map(tc => ({
            id: tc.id, name: tc.function.name,
            args: JSON.parse(tc.function.arguments),
          })),
        };
        session.messages.push(assistantMsg);
        aiMessages.push({
          role: 'assistant', content: response.content || '',
          toolCalls: response.toolCalls,
        });

        // Execute each tool call
        for (const toolCall of response.toolCalls) {
          updateSessionState(session, 'executing');
          onStateChange?.('executing');

          let toolArgs: Record<string, unknown>;
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch {
            toolArgs = {};
          }

          const result = await executeTool({
            toolName: toolCall.function.name,
            args: toolArgs,
            sessionId,
          });

          const toolResultContent = result.success
            ? JSON.stringify(result.result)
            : `Error: ${result.error}`;

          // Add tool result message
          const toolMsg: AgentMessage = {
            id: generateId(), role: 'tool',
            content: toolResultContent,
            timestamp: new Date().toISOString(),
            toolResults: [{ toolCallId: toolCall.id, result: result.result, error: result.error }],
          };
          session.messages.push(toolMsg);
          aiMessages.push({
            role: 'tool', content: toolResultContent, toolCallId: toolCall.id,
          });
        }

        // Continue loop to get AI's response to tool results
        continue;
      }

      // No tool calls — final response
      assistantContent = response.content;
      break;
    } catch (error: any) {
      assistantContent = `I encountered an error: ${error.message}\n\nPlease check your AI provider connection in Settings → Connections.`;
      break;
    }
  }

  // 6. Add final assistant message
  const assistantMessage: AgentMessage = {
    id: generateId(), role: 'assistant',
    content: assistantContent,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(assistantMessage);
  updateSessionState(session, 'idle');
  onStateChange?.('idle');

  // 7. Persist
  persistSession(session);

  // 8. Store in memory for future context
  createMemory({
    userId: session.userId, category: 'working',
    content: `User: ${content}\nAgent: ${assistantContent.slice(0, 500)}`,
    tags: ['conversation'], source: 'agent', importance: 0.5,
  });

  return assistantMessage;
}

/**
 * Stream a response from the agent.
 */
export async function* streamMessage(
  sessionId: string,
  content: string,
  onStateChange?: (state: AgentState) => void
): AsyncGenerator<string> {
  const session = getSession(sessionId);
  if (!session) throw new Error('Session not found');

  const userMessage: AgentMessage = {
    id: generateId(), role: 'user', content, timestamp: new Date().toISOString(),
  };
  session.messages.push(userMessage);
  updateSessionState(session, 'thinking');
  onStateChange?.('thinking');

  const memoryContext = getRelevantContext(session.userId, content);
  const aiMessages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + (memoryContext ? `\n\nRelevant context:\n${memoryContext}` : '') },
    ...session.messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'tool',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    })),
  ];

  try {
    let fullContent = '';
    for await (const chunk of routeStream(session.userId, { model: '', messages: aiMessages }, session.providerId)) {
      if (chunk.delta.content) {
        fullContent += chunk.delta.content;
        yield chunk.delta.content;
      }
    }

    session.messages.push({
      id: generateId(), role: 'assistant', content: fullContent, timestamp: new Date().toISOString(),
    });
    persistSession(session);
  } catch (error: any) {
    yield `\n\nError: ${error.message}`;
  }

  updateSessionState(session, 'idle');
  onStateChange?.('idle');
}
