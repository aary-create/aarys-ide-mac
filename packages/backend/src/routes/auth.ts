// ============================================================
// Aary's IDE — Authentication Routes
// ============================================================

import { Router } from 'express';
import { getGoogleAuthUrl, handleGoogleCallback } from '../auth/google.js';
import { getGitHubAuthUrl, handleGitHubCallback } from '../auth/github.js';
import { authMiddleware, invalidateSession } from '../auth/session.js';
import { db } from '../database.js';

export const authRouter = Router();

authRouter.get('/google', (req, res) => {
  const url = getGoogleAuthUrl(req.query.state as string);
  res.redirect(url);
});

authRouter.get('/google/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const result = await handleGoogleCallback(code);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.get('/github', (req, res) => {
  const url = getGitHubAuthUrl(req.query.state as string);
  res.redirect(url);
});

authRouter.get('/github/callback', async (req, res) => {
  const code = req.query.code as string;
  try {
    const result = await handleGitHubCallback(code);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, name, avatar_url, provider, settings FROM users WHERE id = ?')
    .get((req as any).userId);
  res.json({ success: true, data: user });
});

authRouter.post('/logout', authMiddleware, (req, res) => {
  invalidateSession((req as any).sessionId);
  res.json({ success: true });
});
