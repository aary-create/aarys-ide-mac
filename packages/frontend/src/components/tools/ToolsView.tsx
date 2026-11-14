// ============================================================
// Aary's IDE — Tools & MCP Manager
// ============================================================

import React, { useEffect, useState } from 'react';
import { Wrench, Terminal, Database, Shield, Check, Plus } from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui/index.js';
import { apiRequest } from '../../api/client.js';

export const ToolsView: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [mcpServers, setMcpServers] = useState<any[]>([]);
  const [mcpName, setMcpName] = useState('');
  const [mcpCommand, setMcpCommand] = useState('');

  useEffect(() => {
    apiRequest('/tools').then((data) => setTools(data || [])).catch(() => {});
    apiRequest('/tools/mcp').then((data) => setMcpServers(data || [])).catch(() => {});
  }, []);

  const handleAddMCP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mcpName || !mcpCommand) return;
    try {
      await apiRequest('/tools/mcp/connect', {
        method: 'POST',
        body: JSON.stringify({
          id: `mcp_${Date.now()}`,
          name: mcpName,
          command: mcpCommand,
          transport: 'stdio',
        }),
      });
      setMcpName('');
      setMcpCommand('');
      const updated = await apiRequest('/tools/mcp');
      setMcpServers(updated || []);
    } catch (err: any) {
      alert(`MCP Connect Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tools & MCP Registry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Model Context Protocol servers, native developer capabilities, and autonomous tools.
        </p>
      </div>

      {/* Add MCP */}
      <Card title="Connect MCP Server" subtitle="Add standard Model Context Protocol stdio or HTTP server">
        <form onSubmit={handleAddMCP} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Input
            label="Server Name"
            placeholder="e.g. SQLite Explorer"
            value={mcpName}
            onChange={(e) => setMcpName(e.target.value)}
          />
          <Input
            label="Command / Binary"
            placeholder="e.g. npx -y @modelcontextprotocol/server-sqlite"
            value={mcpCommand}
            onChange={(e) => setMcpCommand(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="submit" size="md" className="w-full">
              <Plus className="w-4 h-4 mr-1" />
              Add Server
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Tools List */}
      <Card title="Available Native Tools" subtitle="Built-in capabilities exposed to AI models">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {tools.map((t, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{t.name}</span>
                <Badge variant="neutral">{t.category}</Badge>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
