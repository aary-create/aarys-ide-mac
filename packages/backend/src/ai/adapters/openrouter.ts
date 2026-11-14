// ============================================================
// Aary's IDE — OpenRouter Adapter
// ============================================================

import type { AIModel, ModelCapabilities } from '@aarys-ide/shared';
import { OpenAIAdapter } from './openai.js';

export class OpenRouterAdapter extends OpenAIAdapter {
  override readonly type = 'openrouter';
  override readonly name = 'OpenRouter';

  override async listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    const url = `${baseUrl || 'https://openrouter.ai/api/v1'}/models`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) throw new Error(`OpenRouter models error: ${res.statusText}`);
    const data = await res.json() as any;
    return (data.data || []).slice(0, 100).map((m: any) => ({
      id: m.id, name: m.name || m.id, providerId: 'openrouter',
      capabilities: this.detectCapabilities(m.id),
      contextWindow: m.context_length,
    }));
  }

  override async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    return super.testConnection(apiKey, baseUrl || 'https://openrouter.ai/api/v1');
  }

  override detectCapabilities(modelId: string): ModelCapabilities {
    return {
      toolCalling: true, vision: modelId.includes('vision') || modelId.includes('gpt-4'),
      audio: false, speech: false, structuredOutput: true, streaming: true,
      longContext: true, coding: true, reasoning: modelId.includes('o1') || modelId.includes('claude'),
    };
  }
}
