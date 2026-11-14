// ============================================================
// Aary's IDE — AI Provider Registry
// Manages all AI provider adapters
// ============================================================

import type { AIProviderConfig, AIModel, AIProviderType } from '@aarys-ide/shared';
import type { AIAdapter } from './adapters/base.js';
import { OpenAIAdapter } from './adapters/openai.js';
import { AnthropicAdapter } from './adapters/anthropic.js';
import { GeminiAdapter } from './adapters/gemini.js';
import { OllamaAdapter } from './adapters/ollama.js';
import { OmniRouteAdapter } from './adapters/omniroute.js';
import { OpenRouterAdapter } from './adapters/openrouter.js';
import { CustomAdapter } from './adapters/custom.js';
import { db } from '../database.js';
import { config } from '../config.js';
import { decrypt, encrypt } from '@aarys-ide/shared';

const adapters: Record<AIProviderType, AIAdapter> = {
  openai: new OpenAIAdapter(),
  anthropic: new AnthropicAdapter(),
  gemini: new GeminiAdapter(),
  ollama: new OllamaAdapter(),
  omniroute: new OmniRouteAdapter(),
  openrouter: new OpenRouterAdapter(),
  custom: new CustomAdapter(),
};

export function getAdapter(type: AIProviderType): AIAdapter {
  const adapter = adapters[type];
  if (!adapter) throw new Error(`Unknown AI provider type: ${type}`);
  return adapter;
}

export function listProviders(userId: string): AIProviderConfig[] {
  const rows = db.prepare('SELECT * FROM ai_providers WHERE user_id = ?').all(userId) as any[];
  return rows.map(row => ({
    id: row.id,
    type: row.type as AIProviderType,
    name: row.name,
    baseUrl: row.base_url || undefined,
    enabled: Boolean(row.enabled),
    models: JSON.parse(row.models || '[]'),
    defaultModelId: row.default_model_id || undefined,
    connected: Boolean(row.connected),
    lastTestedAt: row.last_tested_at || undefined,
    error: row.error || undefined,
    // Never expose API key
  }));
}

export function getProviderConfig(providerId: string): { config: AIProviderConfig; apiKey: string } | null {
  const row = db.prepare('SELECT * FROM ai_providers WHERE id = ?').get(providerId) as any;
  if (!row) return null;
  const apiKey = row.api_key_encrypted ? decrypt(row.api_key_encrypted, config.encryptionKey) : '';
  return {
    config: {
      id: row.id, type: row.type, name: row.name, baseUrl: row.base_url,
      enabled: Boolean(row.enabled), models: JSON.parse(row.models || '[]'),
      defaultModelId: row.default_model_id, connected: Boolean(row.connected),
    },
    apiKey,
  };
}

export async function addProvider(
  userId: string, type: AIProviderType, name: string, apiKey: string, baseUrl?: string
): Promise<AIProviderConfig> {
  const adapter = getAdapter(type);
  const id = `${type}_${Date.now()}`;
  const encryptedKey = apiKey ? encrypt(apiKey, config.encryptionKey) : '';

  // Test connection
  let connected = false;
  let error: string | undefined;
  let models: AIModel[] = [];
  try {
    connected = await adapter.testConnection(apiKey, baseUrl);
    if (connected) {
      models = await adapter.listModels(apiKey, baseUrl);
    }
  } catch (e: any) {
    error = e.message;
  }

  db.prepare(`
    INSERT INTO ai_providers (id, user_id, type, name, base_url, api_key_encrypted, enabled, models, connected, last_tested_at, error)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
  `).run(id, userId, type, name, baseUrl || null, encryptedKey, JSON.stringify(models), connected ? 1 : 0, new Date().toISOString(), error || null);

  return { id, type, name, baseUrl, enabled: true, models, connected, lastTestedAt: new Date().toISOString(), error };
}

export async function testProvider(providerId: string): Promise<{ connected: boolean; models: AIModel[]; error?: string }> {
  const providerData = getProviderConfig(providerId);
  if (!providerData) throw new Error('Provider not found');
  const { config: provConfig, apiKey } = providerData;
  const adapter = getAdapter(provConfig.type);

  try {
    const connected = await adapter.testConnection(apiKey, provConfig.baseUrl);
    let models: AIModel[] = [];
    if (connected) models = await adapter.listModels(apiKey, provConfig.baseUrl);
    db.prepare('UPDATE ai_providers SET connected = ?, models = ?, last_tested_at = ?, error = NULL WHERE id = ?')
      .run(connected ? 1 : 0, JSON.stringify(models), new Date().toISOString(), providerId);
    return { connected, models };
  } catch (e: any) {
    db.prepare('UPDATE ai_providers SET connected = 0, error = ?, last_tested_at = ? WHERE id = ?')
      .run(e.message, new Date().toISOString(), providerId);
    return { connected: false, models: [], error: e.message };
  }
}

export function removeProvider(providerId: string): void {
  db.prepare('DELETE FROM ai_providers WHERE id = ?').run(providerId);
}

export function updateProvider(providerId: string, updates: Partial<{ name: string; enabled: boolean; defaultModelId: string; apiKey: string; baseUrl: string }>): void {
  if (updates.apiKey) {
    const encrypted = encrypt(updates.apiKey, config.encryptionKey);
    db.prepare('UPDATE ai_providers SET api_key_encrypted = ? WHERE id = ?').run(encrypted, providerId);
  }
  if (updates.name !== undefined) db.prepare('UPDATE ai_providers SET name = ? WHERE id = ?').run(updates.name, providerId);
  if (updates.enabled !== undefined) db.prepare('UPDATE ai_providers SET enabled = ? WHERE id = ?').run(updates.enabled ? 1 : 0, providerId);
  if (updates.defaultModelId !== undefined) db.prepare('UPDATE ai_providers SET default_model_id = ? WHERE id = ?').run(updates.defaultModelId, providerId);
  if (updates.baseUrl !== undefined) db.prepare('UPDATE ai_providers SET base_url = ? WHERE id = ?').run(updates.baseUrl, providerId);
}
