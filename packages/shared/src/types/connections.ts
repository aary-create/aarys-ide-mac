// ============================================================
// Aary's IDE — Connection Types
// Universal connector system
// ============================================================

export type ConnectionType =
  | 'ai_provider'
  | 'github'
  | 'google'
  | 'whatsapp'
  | 'opencode'
  | 'hermes'
  | 'mcp'
  | 'browser'
  | 'device'
  | 'custom_api';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'requires_setup';

export interface Connection {
  id: string;
  type: ConnectionType;
  name: string;
  description: string;
  status: ConnectionStatus;
  capabilities: string[];
  config: Record<string, unknown>;
  error?: string;
  connectedAt?: string;
  lastUsedAt?: string;
}

// Device registry for cross-device continuity
export type DeviceType = 'android_phone' | 'android_tablet' | 'windows' | 'macos' | 'linux' | 'browser';

export interface Device {
  id: string;
  userId: string;
  name: string;
  type: DeviceType;
  os: string;
  osVersion?: string;
  capabilities: string[];
  isOnline: boolean;
  isCurrentDevice: boolean;
  lastSeenAt: string;
  workspaces: string[];
  registeredAt: string;
}

export interface DeviceSync {
  fromDeviceId: string;
  toDeviceId: string;
  taskId?: string;
  data: 'conversation' | 'task' | 'project' | 'memory' | 'files';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  timestamp: string;
}
