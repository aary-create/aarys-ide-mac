// ============================================================
// Aary's IDE — Agent Types
// Central agent runtime type definitions
// ============================================================

/** Unique identifier for an agent session */
export type AgentSessionId = string;

/** Agent execution states */
export type AgentState =
  | 'idle'
  | 'thinking'
  | 'planning'
  | 'executing'
  | 'observing'
  | 'verifying'
  | 'waiting_approval'
  | 'paused'
  | 'error'
  | 'completed';

/** The central agent's capabilities */
export interface AgentCapabilities {
  coding: boolean;
  browser: boolean;
  computerUse: boolean;
  fileGeneration: boolean;
  terminal: boolean;
  git: boolean;
  speech: boolean;
  vision: boolean;
}

/** A single step in the agent's execution plan */
export interface AgentPlanStep {
  id: string;
  description: string;
  tool: string;
  args?: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: unknown;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/** An agent execution plan */
export interface AgentPlan {
  id: string;
  taskId: string;
  steps: AgentPlanStep[];
  reasoning: string;
  createdAt: string;
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
}

/** Agent action requiring user approval */
export interface ApprovalRequest {
  id: string;
  taskId: string;
  action: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt?: string;
}

/** Message in the agent conversation */
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: string;
  attachments?: MessageAttachment[];
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  metadata?: Record<string, unknown>;
}

export interface MessageAttachment {
  id: string;
  type: 'file' | 'image' | 'audio' | 'video' | 'code';
  name: string;
  path?: string;
  url?: string;
  mimeType: string;
  size?: number;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  result: unknown;
  error?: string;
}

/** Agent session containing conversation + task state */
export interface AgentSession {
  id: AgentSessionId;
  userId: string;
  state: AgentState;
  messages: AgentMessage[];
  currentPlan?: AgentPlan;
  activeTaskId?: string;
  deviceId?: string;
  workspaceId?: string;
  providerId?: string;
  modelId?: string;
  capabilities: AgentCapabilities;
  createdAt: string;
  updatedAt: string;
}
