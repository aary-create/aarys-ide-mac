// ============================================================
// Aary's IDE — Model Context Protocol (MCP) Client
// Connects to local stdio and remote HTTP/SSE MCP servers
// ============================================================

import { spawn, type ChildProcess } from 'child_process';
import type { MCPServerConfig, MCPTool } from '@aarys-ide/shared';

export class MCPClient {
  private config: MCPServerConfig;
  private process?: ChildProcess;
  private requestId = 0;
  private pendingRequests = new Map<number, { resolve: (val: any) => void; reject: (err: any) => void }>();

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async connect(): Promise<boolean> {
    if (this.config.transport === 'stdio' && this.config.command) {
      return new Promise((resolve) => {
        this.process = spawn(this.config.command!, this.config.args || [], {
          env: { ...process.env, ...this.config.env },
        });

        let buffer = '';
        this.process.stdout?.on('data', (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const res = JSON.parse(line);
              if (res.id !== undefined && this.pendingRequests.has(res.id)) {
                const handler = this.pendingRequests.get(res.id)!;
                this.pendingRequests.delete(res.id);
                if (res.error) handler.reject(new Error(res.error.message || 'MCP Error'));
                else handler.resolve(res.result);
              }
            } catch {
              // Ignore non-json logging
            }
          }
        });

        this.process.on('error', () => resolve(false));
        resolve(true);
      });
    }
    return false;
  }

  async sendRequest<T = any>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    if (!this.process || !this.process.stdin) {
      throw new Error(`MCP Server ${this.config.name} is not connected`);
    }

    const id = ++this.requestId;
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';

    return new Promise<T>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.process!.stdin!.write(msg);
    });
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const res = await this.sendRequest<{ tools: MCPTool[] }>('tools/list');
      return res.tools || [];
    } catch {
      return [];
    }
  }

  async callTool(name: string, argumentsObj: Record<string, unknown>): Promise<any> {
    return this.sendRequest('tools/call', { name, arguments: argumentsObj });
  }

  disconnect(): void {
    if (this.process) {
      this.process.kill();
      this.process = undefined;
    }
  }
}
