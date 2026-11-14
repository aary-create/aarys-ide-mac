// ============================================================
// Aary's IDE — Task Types
// Persistent task execution system
// ============================================================

export type TaskId = string;

export type TaskStatus =
  | 'requested'
  | 'planned'
  | 'started'
  | 'executing'
  | 'paused'
  | 'waiting_approval'
  | 'completed'
  | 'built'
  | 'tested'
  | 'verified'
  | 'failed'
  | 'blocked'
  | 'cancelled';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: TaskId;
  userId: string;
  sessionId: string;
  title: string;
  originalRequest: string;
  status: TaskStatus;
  priority: TaskPriority;
  plan?: import('./agent.js').AgentPlan;
  completedSteps: string[];
  pendingSteps: string[];
  toolHistory: TaskToolExecution[];
  errors: TaskError[];
  results: TaskResult[];
  artifacts: TaskArtifact[];
  approvals: import('./agent.js').ApprovalRequest[];
  deviceId?: string;
  workspaceId?: string;
  projectId?: string;
  parentTaskId?: string;
  childTaskIds: string[];
  progress: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface TaskToolExecution {
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  error?: string;
  duration?: number;
  timestamp: string;
}

export interface TaskError {
  message: string;
  code?: string;
  tool?: string;
  recoverable: boolean;
  timestamp: string;
}

export interface TaskResult {
  type: 'file' | 'output' | 'url' | 'message' | 'artifact';
  description: string;
  value: string;
  verified: boolean;
  timestamp: string;
}

export interface TaskArtifact {
  id: string;
  type: 'file' | 'directory' | 'repository' | 'url' | 'screenshot';
  name: string;
  path?: string;
  url?: string;
  mimeType?: string;
  size?: number;
  createdAt: string;
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: string;
  deviceId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
