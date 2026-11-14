// Aary's IDE — Knowledge Memory
import { createMemory, searchMemory, getMemoriesByCategory } from './store.js';

export function saveKnowledge(userId: string, content: string, tags: string[] = []) {
  return createMemory({ userId, category: 'knowledge', content, tags, source: 'agent', importance: 0.6 });
}
export function searchKnowledge(userId: string, query: string) {
  return searchMemory({ query, category: 'knowledge', limit: 10 }, userId);
}
export function getRecentKnowledge(userId: string) {
  return getMemoriesByCategory(userId, 'knowledge', 20);
}
