// ============================================================
// Aary's IDE — Workspace Types
// ============================================================

export type WorkspaceId = string;

export type WorkspaceType = 'local' | 'remote' | 'cloud' | 'temporary';

export interface Workspace {
  id: WorkspaceId;
  userId: string;
  name: string;
  type: WorkspaceType;
  path: string;
  deviceId: string;
  remoteHost?: string;
  remotePort?: number;
  remoteUser?: string;
  gitUrl?: string;
  gitBranch?: string;
  language?: string;
  framework?: string;
  isActive: boolean;
  lastOpenedAt: string;
  createdAt: string;
}

export interface WorkspaceFile {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mimeType?: string;
  modifiedAt?: string;
  children?: WorkspaceFile[];
}

export interface FileOperation {
  type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'rename';
  path: string;
  content?: string;
  newPath?: string;
  encoding?: string;
}
