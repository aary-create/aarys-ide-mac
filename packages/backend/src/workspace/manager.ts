// ============================================================
// Aary's IDE — Workspace Manager
// ============================================================

import type { Workspace } from '@aarys-ide/shared';
import { generateId } from '@aarys-ide/shared';
import { db } from '../database.js';
import { LocalWorkspace } from './local.js';
import fs from 'fs/promises';

const activeWorkspaces = new Map<string, LocalWorkspace>();

export function listWorkspaces(userId: string): Workspace[] {
  const rows = db.prepare('SELECT * FROM workspaces WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    type: r.type,
    path: r.path,
    deviceId: r.device_id,
    gitUrl: r.git_url,
    language: r.language,
    framework: r.framework,
    isActive: Boolean(r.is_active),
    lastOpenedAt: r.created_at,
    createdAt: r.created_at,
  }));
}

export async function createWorkspace(
  userId: string,
  name: string,
  dirPath: string,
  type: 'local' | 'remote' = 'local'
): Promise<Workspace> {
  const id = generateId();
  const now = new Date().toISOString();

  await fs.mkdir(dirPath, { recursive: true });

  db.prepare(`
    INSERT INTO workspaces (id, user_id, name, type, path, device_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, 'local_default', 1, ?)
  `).run(id, userId, name, type, dirPath, now);

  const ws = new LocalWorkspace(dirPath);
  activeWorkspaces.set(id, ws);

  return {
    id,
    userId,
    name,
    type,
    path: dirPath,
    deviceId: 'local_default',
    isActive: true,
    lastOpenedAt: now,
    createdAt: now,
  };
}

export function getLocalWorkspace(workspaceId: string): LocalWorkspace | null {
  if (activeWorkspaces.has(workspaceId)) return activeWorkspaces.get(workspaceId)!;

  const row = db.prepare('SELECT path FROM workspaces WHERE id = ?').get(workspaceId) as any;
  if (!row) return null;

  const ws = new LocalWorkspace(row.path);
  activeWorkspaces.set(workspaceId, ws);
  return ws;
}
