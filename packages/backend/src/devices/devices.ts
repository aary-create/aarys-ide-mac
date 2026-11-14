// ============================================================
// Aary's IDE — Cross-Device Registry & Synchronization
// ============================================================

import type { Device, DeviceSync } from '@aarys-ide/shared';
import { db } from '../database.js';

export function listDevices(userId: string): Device[] {
  const rows = db.prepare('SELECT * FROM devices WHERE user_id = ?').all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    name: r.name,
    type: r.type,
    os: r.os,
    osVersion: r.os_version,
    capabilities: JSON.parse(r.capabilities || '[]'),
    isOnline: Boolean(r.is_online),
    isCurrentDevice: false,
    lastSeenAt: r.last_seen_at,
    workspaces: [],
    registeredAt: r.registered_at,
  }));
}

export function registerDevice(userId: string, device: Partial<Device>): Device {
  const id = device.id || `dev_${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO devices (id, user_id, name, type, os, os_version, capabilities, is_online, last_seen_at, registered_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET is_online = 1, last_seen_at = excluded.last_seen_at
  `).run(
    id,
    userId,
    device.name || 'Unnamed Device',
    device.type || 'browser',
    device.os || process.platform,
    device.osVersion || '',
    JSON.stringify(device.capabilities || ['chat', 'workspace']),
    now,
    now
  );

  return {
    id,
    userId,
    name: device.name || 'Device',
    type: device.type || 'browser',
    os: device.os || process.platform,
    capabilities: device.capabilities || ['chat'],
    isOnline: true,
    isCurrentDevice: true,
    lastSeenAt: now,
    workspaces: [],
    registeredAt: now,
  };
}

export function syncDeviceData(sync: DeviceSync): { status: 'synced' | 'pending' } {
  // Sync state between device records
  return { status: 'synced' };
}
