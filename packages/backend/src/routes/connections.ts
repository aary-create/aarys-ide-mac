// ============================================================
// Aary's IDE — Universal Connections Routes
// ============================================================

import { Router } from 'express';
import { db } from '../database.js';

export const connectionsRouter = Router();

connectionsRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const rows = db.prepare('SELECT * FROM connections WHERE user_id = ?').all(userId) as any[];
  const connections = rows.map((r) => ({
    id: r.id,
    type: r.type,
    name: r.name,
    status: r.status,
    connectedAt: r.connected_at,
    error: r.error,
  }));
  res.json({ success: true, data: connections });
});

connectionsRouter.post('/:type/disconnect', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  db.prepare('DELETE FROM connections WHERE user_id = ? AND type = ?').run(userId, req.params.type);
  res.json({ success: true });
});
