// ============================================================
// Aary's IDE — Memory Store
// SQLite-backed persistent memory system
// ============================================================

import type { MemoryEntry, MemoryCategory, MemorySearchQuery, MemorySearchResult } from '@aarys-ide/shared';
import { db } from '../database.js';
import { generateId } from '@aarys-ide/shared';

export function createMemory(entry: Omit<MemoryEntry, 'id' | 'accessCount' | 'createdAt' | 'updatedAt' | 'lastAccessedAt'>): MemoryEntry {
  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO memory (id, user_id, category, content, tags, project_id, task_id, device_id, source, importance, access_count, created_at, updated_at, last_accessed_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
  `).run(id, entry.userId, entry.category, entry.content, JSON.stringify(entry.tags), entry.projectId || null, entry.taskId || null, entry.deviceId || null, entry.source, entry.importance, now, now, now, entry.expiresAt || null);
  return { ...entry, id, accessCount: 0, createdAt: now, updatedAt: now, lastAccessedAt: now };
}

export function getMemory(id: string): MemoryEntry | null {
  const row = db.prepare('SELECT * FROM memory WHERE id = ?').get(id) as any;
  if (!row) return null;
  // Update access count
  db.prepare('UPDATE memory SET access_count = access_count + 1, last_accessed_at = ? WHERE id = ?').run(new Date().toISOString(), id);
  return rowToMemory(row);
}

export function updateMemory(id: string, updates: Partial<Pick<MemoryEntry, 'content' | 'tags' | 'importance'>>): void {
  const sets: string[] = ['updated_at = ?'];
  const vals: unknown[] = [new Date().toISOString()];
  if (updates.content !== undefined) { sets.push('content = ?'); vals.push(updates.content); }
  if (updates.tags !== undefined) { sets.push('tags = ?'); vals.push(JSON.stringify(updates.tags)); }
  if (updates.importance !== undefined) { sets.push('importance = ?'); vals.push(updates.importance); }
  vals.push(id);
  db.prepare(`UPDATE memory SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
}

export function deleteMemory(id: string): void {
  db.prepare('DELETE FROM memory WHERE id = ?').run(id);
}

export function searchMemory(query: MemorySearchQuery, userId: string): MemorySearchResult[] {
  let sql = 'SELECT * FROM memory WHERE user_id = ?';
  const params: unknown[] = [userId];

  if (query.category) { sql += ' AND category = ?'; params.push(query.category); }
  if (query.projectId) { sql += ' AND project_id = ?'; params.push(query.projectId); }
  if (query.taskId) { sql += ' AND task_id = ?'; params.push(query.taskId); }
  if (query.minImportance) { sql += ' AND importance >= ?'; params.push(query.minImportance); }
  if (query.query) { sql += ' AND content LIKE ?'; params.push(`%${query.query}%`); }
  if (query.tags?.length) {
    for (const tag of query.tags) {
      sql += ' AND tags LIKE ?'; params.push(`%"${tag}"%`);
    }
  }
  sql += ' ORDER BY importance DESC, last_accessed_at DESC';
  if (query.limit) { sql += ' LIMIT ?'; params.push(query.limit); }

  const rows = db.prepare(sql).all(...params) as any[];
  return rows.map(row => ({
    entry: rowToMemory(row),
    relevance: query.query ? calculateRelevance(row.content, query.query) : row.importance,
  }));
}

export function getMemoriesByCategory(userId: string, category: MemoryCategory, limit = 50): MemoryEntry[] {
  const rows = db.prepare('SELECT * FROM memory WHERE user_id = ? AND category = ? ORDER BY updated_at DESC LIMIT ?').all(userId, category, limit) as any[];
  return rows.map(rowToMemory);
}

export function clearProjectMemory(userId: string, projectId: string): void {
  db.prepare('DELETE FROM memory WHERE user_id = ? AND project_id = ?').run(userId, projectId);
}

function rowToMemory(row: any): MemoryEntry {
  return {
    id: row.id, userId: row.user_id, category: row.category, content: row.content,
    tags: JSON.parse(row.tags || '[]'), projectId: row.project_id || undefined,
    taskId: row.task_id || undefined, deviceId: row.device_id || undefined,
    source: row.source, importance: row.importance, accessCount: row.access_count,
    createdAt: row.created_at, updatedAt: row.updated_at, lastAccessedAt: row.last_accessed_at,
    expiresAt: row.expires_at || undefined,
  };
}

function calculateRelevance(content: string, query: string): number {
  const lower = content.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/);
  let matches = 0;
  for (const term of terms) {
    if (lower.includes(term)) matches++;
  }
  return terms.length > 0 ? matches / terms.length : 0;
}
