// ============================================================
// Aary's IDE — Tools & MCP Routes
// ============================================================

import { Router } from 'express';
import { listTools, executeTool } from '../tools/registry.js';
import { listMCPServers, connectMCPServer, disconnectMCPServer } from '../integrations/mcp/registry.js';

export const toolsRouter = Router();

toolsRouter.get('/', (_req, res) => {
  res.json({ success: true, data: listTools() });
});

toolsRouter.post('/execute', async (req, res) => {
  try {
    const result = await executeTool(req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

toolsRouter.get('/mcp', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  res.json({ success: true, data: listMCPServers(userId) });
});

toolsRouter.post('/mcp/connect', async (req, res) => {
  const success = await connectMCPServer(req.body);
  res.json({ success });
});

toolsRouter.post('/mcp/:id/disconnect', (req, res) => {
  disconnectMCPServer(req.params.id);
  res.json({ success: true });
});
