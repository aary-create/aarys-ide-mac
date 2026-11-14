// ============================================================
// Aary's IDE — WebSocket & API Message Types
// ============================================================

/** WebSocket event types */
export type WSEventType =
  | 'agent:message'
  | 'agent:state_change'
  | 'agent:plan_update'
  | 'agent:tool_execution'
  | 'agent:stream_chunk'
  | 'agent:approval_request'
  | 'task:update'
  | 'task:progress'
  | 'task:completed'
  | 'task:error'
  | 'memory:update'
  | 'device:status'
  | 'notification'
  | 'error';

export interface WSMessage<T = unknown> {
  type: WSEventType;
  payload: T;
  timestamp: string;
  sessionId?: string;
}

/** API response wrapper */
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/** Chat request from frontend */
export interface ChatRequest {
  message: string;
  sessionId?: string;
  attachments?: Array<{
    type: 'file' | 'image' | 'audio';
    name: string;
    data: string; // base64
    mimeType: string;
  }>;
  deviceId?: string;
  workspaceId?: string;
  stream?: boolean;
}

/** Notification payload */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  title: string;
  message: string;
  actionUrl?: string;
  taskId?: string;
  read: boolean;
  createdAt: string;
}
