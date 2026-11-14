// ============================================================
// Aary's IDE — Intelligent AI Router
// Routes tasks to appropriate models based on capabilities
// ============================================================

import type { AICompletionRequest, AICompletionResponse, AIStreamChunk, RoutingPreferences } from '@aarys-ide/shared';
import { getAdapter } from './provider-registry.js';
import { getProviderConfig, listProviders } from './provider-registry.js';

export type TaskType = 'coding' | 'research' | 'planning' | 'vision' | 'voice' | 'summarization' | 'tool_execution' | 'general';

export function detectTaskType(message: string): TaskType {
  const lower = message.toLowerCase();
  if (/\b(code|implement|fix|debug|build|compile|function|class|refactor|test)\b/.test(lower)) return 'coding';
  if (/\b(research|search|find|look up|investigate|compare)\b/.test(lower)) return 'research';
  if (/\b(plan|design|architect|strategy|approach|outline)\b/.test(lower)) return 'planning';
  if (/\b(image|screenshot|picture|photo|see|visual|look at)\b/.test(lower)) return 'vision';
  if (/\b(speak|say|voice|audio|listen|pronounce)\b/.test(lower)) return 'voice';
  if (/\b(summarize|summary|tldr|brief|overview)\b/.test(lower)) return 'summarization';
  return 'general';
}

export function selectModel(
  userId: string,
  taskType: TaskType,
  preferences?: RoutingPreferences
): { providerId: string; modelId: string; apiKey: string; baseUrl?: string } | null {
  // Check user routing preferences first
  if (preferences) {
    const prefModelId = preferences[taskType as keyof RoutingPreferences] || preferences.default;
    if (prefModelId) {
      const providers = listProviders(userId);
      for (const p of providers) {
        if (!p.enabled || !p.connected) continue;
        const model = p.models.find(m => m.id === prefModelId);
        if (model) {
          const provData = getProviderConfig(p.id);
          if (provData) return { providerId: p.id, modelId: model.id, apiKey: provData.apiKey, baseUrl: p.baseUrl };
        }
      }
    }
  }

  // Auto-select based on task type and available providers
  const providers = listProviders(userId).filter(p => p.enabled && p.connected && p.models.length > 0);
  if (providers.length === 0) return null;

  for (const provider of providers) {
    const models = provider.models;
    let bestModel = models[0];

    for (const model of models) {
      if (taskType === 'coding' && model.capabilities.coding) { bestModel = model; break; }
      if (taskType === 'vision' && model.capabilities.vision) { bestModel = model; break; }
      if (taskType === 'planning' && model.capabilities.reasoning) { bestModel = model; break; }
      if (taskType === 'voice' && model.capabilities.audio) { bestModel = model; break; }
    }

    const provData = getProviderConfig(provider.id);
    if (provData) {
      return { providerId: provider.id, modelId: bestModel.id, apiKey: provData.apiKey, baseUrl: provider.baseUrl };
    }
  }

  return null;
}

export async function routeCompletion(
  userId: string,
  request: AICompletionRequest,
  providerId?: string
): Promise<AICompletionResponse> {
  let apiKey: string;
  let baseUrl: string | undefined;
  let providerType: string;

  if (providerId) {
    const provData = getProviderConfig(providerId);
    if (!provData) throw new Error('Provider not found');
    apiKey = provData.apiKey;
    baseUrl = provData.config.baseUrl;
    providerType = provData.config.type;
  } else {
    const userMsg = request.messages.find(m => m.role === 'user');
    const taskType = userMsg ? detectTaskType(typeof userMsg.content === 'string' ? userMsg.content : '') : 'general';
    const selected = selectModel(userId, taskType);
    if (!selected) throw new Error('No AI provider connected. Please connect a provider in Settings → Connections.');
    apiKey = selected.apiKey;
    baseUrl = selected.baseUrl;
    request.model = selected.modelId;
    const prov = getProviderConfig(selected.providerId);
    providerType = prov?.config.type || 'openai';
  }

  const adapter = getAdapter(providerType as any);
  return adapter.complete(request, apiKey, baseUrl);
}

export async function* routeStream(
  userId: string,
  request: AICompletionRequest,
  providerId?: string
): AsyncGenerator<AIStreamChunk> {
  let apiKey: string;
  let baseUrl: string | undefined;
  let providerType: string;

  if (providerId) {
    const provData = getProviderConfig(providerId);
    if (!provData) throw new Error('Provider not found');
    apiKey = provData.apiKey;
    baseUrl = provData.config.baseUrl;
    providerType = provData.config.type;
  } else {
    const selected = selectModel(userId, 'general');
    if (!selected) throw new Error('No AI provider connected.');
    apiKey = selected.apiKey;
    baseUrl = selected.baseUrl;
    request.model = selected.modelId;
    const prov = getProviderConfig(selected.providerId);
    providerType = prov?.config.type || 'openai';
  }

  const adapter = getAdapter(providerType as any);
  yield* adapter.stream(request, apiKey, baseUrl);
}
