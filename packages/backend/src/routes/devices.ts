// ============================================================
// Aary's IDE — Devices Routes
// ============================================================

import { Router } from 'express';
import { listDevices, registerDevice, syncDeviceData } from '../devices/devices.js';

export const devicesRouter = Router();

devicesRouter.get('/', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  res.json({ success: true, data: listDevices(userId) });
});

devicesRouter.post('/register', (req, res) => {
  const userId = (req as any).userId || 'default_user';
  const device = registerDevice(userId, req.body);
  res.json({ success: true, data: device });
});

devicesRouter.post('/sync', (req, res) => {
  const result = syncDeviceData(req.body);
  res.json({ success: true, data: result });
});
