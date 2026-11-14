// ============================================================
// Aary's IDE — Agent API Routes
// ============================================================

import { Router } from 'express';
import { createSession, getSession, listSessions, processMessage } from '../agent/runtime.js';
import { resolveApproval } from '../security/security.js';

export const agentRouter = Router();

agentRouter.post('/session', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const session = createSession(userId, req.body.deviceId, req.body.workspaceId);
  res.json({ success: true, data: session });
});

agentRouter.get('/sessions', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const sessions = listSessions(userId);
  res.json({ success: true, data: sessions });
});

agentRouter.get('/session/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });
  res.json({ success: true, data: session });
});

agentRouter.post('/chat', async (req, res) => {
  const { sessionId, message } = req.body;
  const session = getSession(sessionId) || createSession('default_user');

  try {
    const assistantMsg = await processMessage(session.id, message);
    res.json({ success: true, data: assistantMsg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

agentRouter.post('/approve/:id', (req, res) => {
  const success = resolveApproval(req.params.id, true);
  res.json({ success });
});

agentRouter.post('/reject/:id', (req, res) => {
  const success = resolveApproval(req.params.id, false);
  res.json({ success });
});
