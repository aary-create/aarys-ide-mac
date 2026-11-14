// ============================================================
// Aary's IDE — AI Providers Routes
// ============================================================

import { Router } from 'express';
import {
  listProviders,
  addProvider,
  removeProvider,
  updateProvider,
  testProvider,
} from '../ai/provider-registry.js';

export const aiRouter = Router();

aiRouter.get('/providers', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const providers = listProviders(userId);
  res.json({ success: true, data: providers });
});

aiRouter.post('/providers', async (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const { type, name, apiKey, baseUrl } = req.body;
  try {
    const provider = await addProvider(userId, type, name, apiKey, baseUrl);
    res.json({ success: true, data: provider });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

aiRouter.put('/providers/:id', (req, res) => {
  updateProvider(req.params.id, req.body);
  res.json({ success: true });
});

aiRouter.delete('/providers/:id', (req, res) => {
  removeProvider(req.params.id);
  res.json({ success: true });
});

aiRouter.post('/providers/:id/test', async (req, res) => {
  try {
    const result = await testProvider(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
