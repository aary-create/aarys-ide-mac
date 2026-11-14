// Aary's IDE — Task Orchestrator
import type { Task, TaskStatus } from '@aarys-ide/shared';
import { generateId } from '@aarys-ide/shared';
import { db } from '../database.js';

export function createTask(userId: string, sessionId: string, request: string, workspaceId?: string, deviceId?: string): Task {
  const id = generateId();
  const now = new Date().toISOString();
  const task: Task = {
    id, userId, sessionId, title: request.slice(0, 100), originalRequest: request,
    status: 'requested', priority: 'normal', completedSteps: [], pendingSteps: [],
    toolHistory: [], errors: [], results: [], artifacts: [], approvals: [],
    childTaskIds: [], progress: 0, deviceId, workspaceId,
    createdAt: now, updatedAt: now,
  };
  db.prepare(`INSERT INTO tasks (id, user_id, session_id, title, original_request, status, priority, tool_history, errors, results, artifacts, device_id, workspace_id, progress, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, userId, sessionId, task.title, request, 'requested', 'normal', '[]', '[]', '[]', '[]', deviceId || null, workspaceId || null, 0, now, now);
  return task;
}

export function updateTaskStatus(taskId: string, status: TaskStatus, progress?: number) {
  const updates: string[] = ['status = ?', 'updated_at = ?'];
  const vals: unknown[] = [status, new Date().toISOString()];
  if (progress !== undefined) { updates.push('progress = ?'); vals.push(progress); }
  if (status === 'completed' || status === 'failed') { updates.push('completed_at = ?'); vals.push(new Date().toISOString()); }
  vals.push(taskId);
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`).run(...vals);
}

export function getTask(taskId: string): Task | null {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
  if (!row) return null;
  return rowToTask(row);
}

export function listTasks(userId: string, status?: TaskStatus[], limit = 50): Task[] {
  let sql = 'SELECT * FROM tasks WHERE user_id = ?';
  const params: unknown[] = [userId];
  if (status?.length) { sql += ` AND status IN (${status.map(() => '?').join(',')})`; params.push(...status); }
  sql += ' ORDER BY updated_at DESC LIMIT ?';
  params.push(limit);
  return (db.prepare(sql).all(...params) as any[]).map(rowToTask);
}

function rowToTask(row: any): Task {
  return {
    id: row.id, userId: row.user_id, sessionId: row.session_id,
    title: row.title, originalRequest: row.original_request,
    status: row.status, priority: row.priority, completedSteps: [], pendingSteps: [],
    toolHistory: JSON.parse(row.tool_history || '[]'),
    errors: JSON.parse(row.errors || '[]'),
    results: JSON.parse(row.results || '[]'),
    artifacts: JSON.parse(row.artifacts || '[]'),
    approvals: [], childTaskIds: [],
    progress: row.progress, deviceId: row.device_id, workspaceId: row.workspace_id,
    projectId: row.project_id, createdAt: row.created_at, updatedAt: row.updated_at,
    startedAt: row.started_at, completedAt: row.completed_at,
  };
}
