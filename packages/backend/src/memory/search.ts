// Aary's IDE — Unified Memory Search
import { searchMemory } from './store.js';
import type { MemorySearchQuery, MemorySearchResult } from '@aarys-ide/shared';

export function unifiedSearch(userId: string, query: string, limit = 20): MemorySearchResult[] {
  const results = searchMemory({ query, limit: limit * 2 }, userId);
  // Sort by relevance then importance
  results.sort((a, b) => (b.relevance * 0.6 + b.entry.importance * 0.4) - (a.relevance * 0.6 + a.entry.importance * 0.4));
  return results.slice(0, limit);
}

export function getRelevantContext(userId: string, message: string, projectId?: string): string {
  const results = searchMemory({ query: message, projectId, limit: 5, minImportance: 0.3 }, userId);
  if (results.length === 0) return '';
  return results.map(r => `[${r.entry.category}] ${r.entry.content}`).join('\n');
}
