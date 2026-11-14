// ============================================================
// Aary's IDE — Memory Routes
// ============================================================

import { Router } from 'express';
import { searchMemory, createMemory, updateMemory, deleteMemory } from '../memory/store.js';

export const memoryRouter = Router();

memoryRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const query = req.query.q as string || '';
  const category = req.query.category as any;
  const results = searchMemory({ query, category, limit: 50 }, userId);
  res.json({ success: true, data: results });
});

memoryRouter.post('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const entry = createMemory({
    userId,
    category: req.body.category || 'knowledge',
    content: req.body.content,
    tags: req.body.tags || [],
    source: 'user',
    importance: req.body.importance ?? 0.5,
  });
  res.json({ success: true, data: entry });
});

memoryRouter.put('/:id', (req, res) => {
  updateMemory(req.params.id, req.body);
  res.json({ success: true });
});

memoryRouter.delete('/:id', (req, res) => {
  deleteMemory(req.params.id);
  res.json({ success: true });
});
