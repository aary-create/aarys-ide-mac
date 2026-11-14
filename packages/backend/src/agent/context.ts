// ============================================================
// Aary's IDE — Context Manager
// Dynamic context assembly and token budget management
// ============================================================

import type { AgentMessage, AIMessage } from '@aarys-ide/shared';
import { getRelevantContext } from '../memory/search.js';
import { getWorkingMemory } from '../memory/working.js';

export interface ContextOptions {
  userId: string;
  sessionId: string;
  projectId?: string;
  maxTokens?: number;
}

export function buildAgentContext(
  messages: AgentMessage[],
  options: ContextOptions,
  systemPromptBase: string
): AIMessage[] {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
  const userQuery = lastUserMsg ? (typeof lastUserMsg.content === 'string' ? lastUserMsg.content : '') : '';

  const memoryContext = getRelevantContext(options.userId, userQuery, options.projectId);
  const working = getWorkingMemory(options.sessionId);

  let systemPrompt = systemPromptBase;
  if (memoryContext) {
    systemPrompt += `\n\n--- Retrieved Context & Memory ---\n${memoryContext}`;
  }
  if (working.metadata && Object.keys(working.metadata).length > 0) {
    systemPrompt += `\n\n--- Session Metadata ---\n${JSON.stringify(working.metadata)}`;
  }

  const aiMessages: AIMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-30).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'tool',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      toolCallId: m.toolResults?.[0]?.toolCallId,
      toolCalls: m.toolCalls?.map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.name, arguments: JSON.stringify(tc.args) },
      })),
    })),
  ];

  return aiMessages;
}
