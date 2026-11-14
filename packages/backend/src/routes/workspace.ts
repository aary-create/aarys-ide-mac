// ============================================================
// Aary's IDE — Workspace Management Routes
// ============================================================

import { Router } from 'express';
import { listWorkspaces, createWorkspace } from '../workspace/manager.js';

export const workspaceRouter = Router();

workspaceRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  res.json({ success: true, data: listWorkspaces(userId) });
});

workspaceRouter.post('/', async (req, res) => {
  const userId = (req as any).userId || 'default_user';
  try {
    const ws = await createWorkspace(userId, req.body.name, req.body.path, req.body.type);
    res.json({ success: true, data: ws });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
