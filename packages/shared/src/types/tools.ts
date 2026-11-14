// ============================================================
// Aary's IDE — Tool Types
// Agent tool registry and execution
// ============================================================

export type ToolCategory =
  | 'filesystem'
  | 'terminal'
  | 'git'
  | 'browser'
  | 'computer_use'
  | 'file_generation'
  | 'code_execution'
  | 'mcp'
  | 'integration'
  | 'speech';

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  parameters: Record<string, ToolParameter>;
  requiredPermissions: string[];
  requiresApproval: boolean;
  supportedPlatforms: string[];
}

export interface ToolParameter {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: unknown;
  enum?: string[];
}

export interface ToolExecutionRequest {
  toolName: string;
  args: Record<string, unknown>;
  sessionId: string;
  taskId?: string;
  deviceId?: string;
  workspaceId?: string;
}

export interface ToolExecutionResult {
  toolName: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
  output?: string;
  artifacts?: import('./task.js').TaskArtifact[];
}

// MCP Types
export interface MCPServerConfig {
  id: string;
  name: string;
  command?: string;
  args?: string[];
  url?: string;
  transport: 'stdio' | 'sse' | 'streamable-http';
  env?: Record<string, string>;
  enabled: boolean;
  connected: boolean;
  tools: MCPTool[];
  resources?: MCPResource[];
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}
