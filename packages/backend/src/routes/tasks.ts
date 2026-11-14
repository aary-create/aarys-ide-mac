// ============================================================
// Aary's IDE — Tasks Routes
// ============================================================

import { Router } from 'express';
import { listTasks, getTask, updateTaskStatus } from '../agent/orchestrator.js';

export const tasksRouter = Router();

tasksRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const tasks = listTasks(userId);
  res.json({ success: true, data: tasks });
});

tasksRouter.get('/:id', (req, res) => {
  const task = getTask(req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });
  res.json({ success: true, data: task });
});

tasksRouter.post('/:id/pause', (req, res) => {
  updateTaskStatus(req.params.id, 'paused');
  res.json({ success: true });
});

tasksRouter.post('/:id/resume', (req, res) => {
  updateTaskStatus(req.params.id, 'executing');
  res.json({ success: true });
});

tasksRouter.post('/:id/cancel', (req, res) => {
  updateTaskStatus(req.params.id, 'cancelled');
  res.json({ success: true });
});
