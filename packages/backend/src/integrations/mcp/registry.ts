// ============================================================
// Aary's IDE — MCP Server Registry
// ============================================================

import type { MCPServerConfig } from '@aarys-ide/shared';
import { db } from '../../database.js';
import { MCPClient } from './client.js';

const activeClients = new Map<string, MCPClient>();

export function listMCPServers(userId: string): MCPServerConfig[] {
  const rows = db.prepare('SELECT * FROM mcp_servers WHERE user_id = ?').all(userId) as any[];
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    command: r.command,
    args: JSON.parse(r.args || '[]'),
    url: r.url,
    transport: r.transport,
    enabled: Boolean(r.enabled),
    connected: activeClients.has(r.id),
    tools: JSON.parse(r.tools || '[]'),
    error: r.error,
  }));
}

export async function connectMCPServer(config: MCPServerConfig): Promise<boolean> {
  const client = new MCPClient(config);
  const connected = await client.connect();
  if (connected) {
    const tools = await client.listTools();
    config.tools = tools;
    activeClients.set(config.id, client);
    db.prepare('UPDATE mcp_servers SET tools = ?, error = NULL WHERE id = ?')
      .run(JSON.stringify(tools), config.id);
  }
  return connected;
}

export function disconnectMCPServer(id: string): void {
  const client = activeClients.get(id);
  if (client) {
    client.disconnect();
    activeClients.delete(id);
  }
}
