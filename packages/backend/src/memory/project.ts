// Aary's IDE — Project Memory
import type { ProjectMemory } from '@aarys-ide/shared';
import { db } from '../database.js';
import { createMemory, searchMemory } from './store.js';

export function saveProjectMemory(userId: string, project: ProjectMemory) {
  return createMemory({
    userId, category: 'project', content: JSON.stringify(project),
    tags: [project.name, ...(project.techStack || [])], projectId: project.projectId,
    source: 'agent', importance: 0.9,
  });
}

export function getProjectMemory(userId: string, projectId: string): ProjectMemory | null {
  const results = searchMemory({ query: '', category: 'project', projectId, limit: 1 }, userId);
  if (results.length === 0) return null;
  try { return JSON.parse(results[0].entry.content); } catch { return null; }
}

export function searchProjectMemory(userId: string, query: string) {
  return searchMemory({ query, category: 'project', limit: 10 }, userId);
}
