// ============================================================
// Aary's IDE — File Generation & Preview Routes
// ============================================================

import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

export const filesRouter = Router();

filesRouter.post('/generate', async (req, res) => {
  const { path: filePath, content } = req.body;
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    res.json({ success: true, data: { path: filePath, size: Buffer.byteLength(content) } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

filesRouter.post('/preview', async (req, res) => {
  const { path: filePath } = req.body;
  try {
    const stat = await fs.stat(filePath);
    if (stat.size > 2000000) {
      return res.status(400).json({ success: false, error: 'File too large to preview' });
    }
    const content = await fs.readFile(filePath, 'utf8');
    res.json({ success: true, data: { content, size: stat.size } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
