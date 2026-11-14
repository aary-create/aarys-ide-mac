// ============================================================
// Aary's IDE — Projects & File Operations Routes
// ============================================================

import { Router } from 'express';
import { listWorkspaces, createWorkspace, getLocalWorkspace } from '../workspace/manager.js';

export const projectsRouter = Router();

projectsRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const list = listWorkspaces(userId);
  res.json({ success: true, data: list });
});

projectsRouter.post('/', async (req, res) => {
  const userId = (req as any).userId || 'default_user';
  try {
    const ws = await createWorkspace(userId, req.body.name, req.body.path);
    res.json({ success: true, data: ws });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

projectsRouter.get('/:id/files', async (req, res) => {
  const ws = getLocalWorkspace(req.params.id);
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });
  try {
    const tree = await ws.getFileTree();
    res.json({ success: true, data: tree });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

projectsRouter.post('/:id/file', async (req, res) => {
  const ws = getLocalWorkspace(req.params.id);
  if (!ws) return res.status(404).json({ success: false, error: 'Workspace not found' });
  try {
    const result = await ws.applyOperation(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
