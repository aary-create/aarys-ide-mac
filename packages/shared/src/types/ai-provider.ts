// ============================================================
// Aary's IDE — AI Provider Types
// Multi-provider AI routing system
// ============================================================

export type AIProviderId = string;

/** Supported AI provider types */
export type AIProviderType =
  | 'omniroute'
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'custom';

/** Capabilities a model may or may not support */
export interface ModelCapabilities {
  toolCalling: boolean;
  vision: boolean;
  audio: boolean;
  speech: boolean;
  structuredOutput: boolean;
  streaming: boolean;
  longContext: boolean;
  coding: boolean;
  reasoning: boolean;
  maxContextTokens?: number;
}

/** An AI model available through a provider */
export interface AIModel {
  id: string;
  name: string;
  providerId: AIProviderId;
  capabilities: ModelCapabilities;
  contextWindow?: number;
  maxOutputTokens?: number;
  costPerInputToken?: number;
  costPerOutputToken?: number;
}

/** Configuration for connecting to an AI provider */
export interface AIProviderConfig {
  id: AIProviderId;
  type: AIProviderType;
  name: string;
  baseUrl?: string;
  apiKey?: string; // Stored encrypted, never exposed to frontend
  enabled: boolean;
  models: AIModel[];
  defaultModelId?: string;
  connected: boolean;
  lastTestedAt?: string;
  error?: string;
}

/** Request to an AI provider */
export interface AICompletionRequest {
  model: string;
  messages: AIMessage[];
  tools?: AIToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: 'text' | 'json';
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | AIContentPart[];
  toolCallId?: string;
  toolCalls?: AIToolCall[];
}

export type AIContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail?: 'auto' | 'low' | 'high' } }
  | { type: 'audio'; audio: { data: string; format: string } };

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

/** Response from an AI provider */
export interface AICompletionResponse {
  id: string;
  model: string;
  content: string;
  toolCalls?: AIToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
}

/** Streaming chunk */
export interface AIStreamChunk {
  id: string;
  delta: {
    content?: string;
    toolCalls?: Partial<AIToolCall>[];
  };
  finishReason?: string;
}

/** Routing preferences for task-specific model selection */
export interface RoutingPreferences {
  coding?: string;     // model ID
  research?: string;
  planning?: string;
  vision?: string;
  voice?: string;
  summarization?: string;
  toolExecution?: string;
  localInference?: string;
  default?: string;
}
