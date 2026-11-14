// Aary's IDE — Working Memory (current session context)
import type { AgentMessage } from '@aarys-ide/shared';

const sessionContexts = new Map<string, { messages: AgentMessage[]; metadata: Record<string, unknown> }>();

export function getWorkingMemory(sessionId: string) {
  return sessionContexts.get(sessionId) || { messages: [], metadata: {} };
}
export function setWorkingMemory(sessionId: string, messages: AgentMessage[], metadata?: Record<string, unknown>) {
  sessionContexts.set(sessionId, { messages, metadata: metadata || {} });
}
export function appendMessage(sessionId: string, message: AgentMessage) {
  const ctx = getWorkingMemory(sessionId);
  ctx.messages.push(message);
  sessionContexts.set(sessionId, ctx);
}
export function clearWorkingMemory(sessionId: string) { sessionContexts.delete(sessionId); }
