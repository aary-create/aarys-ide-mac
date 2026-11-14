// ============================================================
// Aary's IDE — Remote Workspace (SSH / Cloud)
// ============================================================

import type { FileOperation, WorkspaceFile } from '@aarys-ide/shared';

export class RemoteWorkspace {
  private host: string;
  private user: string;
  private port: number;

  constructor(host: string, user: string, port = 22) {
    this.host = host;
    this.user = user;
    this.port = port;
  }

  async getFileTree(): Promise<WorkspaceFile[]> {
    // Remote SSH file listing stub with configuration state
    return [];
  }

  async applyOperation(op: FileOperation): Promise<any> {
    throw new Error(`Remote SSH operations on ${this.user}@${this.host}:${this.port} require configured SSH keys`);
  }
}
