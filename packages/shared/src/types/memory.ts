// ============================================================
// Aary's IDE — Memory Types
// Persistent memory independent of AI model
// ============================================================

export type MemoryId = string;

export type MemoryCategory =
  | 'working'    // Current conversation, task, immediate context
  | 'user'       // Stable preferences, instructions
  | 'project'    // Project goals, architecture, decisions
  | 'task'       // Task plans, completed actions, errors
  | 'knowledge'; // Technical discoveries, reusable info

export interface MemoryEntry {
  id: MemoryId;
  userId: string;
  category: MemoryCategory;
  content: string;
  tags: string[];
  projectId?: string;
  taskId?: string;
  deviceId?: string;
  source: 'user' | 'agent' | 'system';
  importance: number; // 0.0 to 1.0
  accessCount: number;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  expiresAt?: string;
}

export interface MemorySearchQuery {
  query: string;
  category?: MemoryCategory;
  projectId?: string;
  taskId?: string;
  tags?: string[];
  limit?: number;
  minImportance?: number;
}

export interface MemorySearchResult {
  entry: MemoryEntry;
  relevance: number;
}

export interface ConversationHistory {
  id: string;
  userId: string;
  title: string;
  messages: import('./agent.js').AgentMessage[];
  projectId?: string;
  deviceId?: string;
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemory {
  projectId: string;
  name: string;
  purpose?: string;
  requirements?: string[];
  architecture?: string;
  techStack?: string[];
  files?: string[];
  dependencies?: string[];
  decisions?: string[];
  currentState?: string;
  bugs?: string[];
  nextActions?: string[];
  repositoryUrl?: string;
  conversationRefs?: string[];
  createdAt: string;
  updatedAt: string;
}
