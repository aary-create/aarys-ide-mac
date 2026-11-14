// Aary's IDE — User Memory
import { createMemory, searchMemory, getMemoriesByCategory } from './store.js';

export function rememberUserPreference(userId: string, content: string, tags: string[] = []) {
  return createMemory({ userId, category: 'user', content, tags, source: 'agent', importance: 0.8 });
}
export function getUserPreferences(userId: string) {
  return getMemoriesByCategory(userId, 'user', 20);
}
export function searchUserMemory(userId: string, query: string) {
  return searchMemory({ query, category: 'user', limit: 10 }, userId);
}
