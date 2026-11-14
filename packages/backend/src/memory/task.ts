// Aary's IDE — Task Memory
import { createMemory, searchMemory } from './store.js';

export function saveTaskMemory(userId: string, taskId: string, content: string, tags: string[] = []) {
  return createMemory({ userId, category: 'task', content, tags, taskId, source: 'agent', importance: 0.7 });
}
export function getTaskHistory(userId: string, taskId: string) {
  return searchMemory({ category: 'task', taskId, limit: 50 }, userId);
}
