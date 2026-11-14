// ============================================================
// Aary's IDE — OmniRoute Adapter
// OpenAI-compatible API
// ============================================================

import type { AIModel, ModelCapabilities } from '@aarys-ide/shared';
import { OpenAIAdapter } from './openai.js';

export class OmniRouteAdapter extends OpenAIAdapter {
  override readonly type = 'omniroute';
  override readonly name = 'OmniRoute';

  override async listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    try {
      const models = await super.listModels(apiKey, baseUrl || 'https://api.omniroute.ai/v1');
      return models.map(m => ({ ...m, providerId: 'omniroute' }));
    } catch {
      // Return common models if listing fails
      return ['omniroute-auto', 'omniroute-fast', 'omniroute-best'].map(id => ({
        id, name: id, providerId: 'omniroute',
        capabilities: this.detectCapabilities(id),
      }));
    }
  }

  override async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    return super.testConnection(apiKey, baseUrl || 'https://api.omniroute.ai/v1');
  }

  override detectCapabilities(_modelId: string): ModelCapabilities {
    return {
      toolCalling: true, vision: true, audio: false, speech: false,
      structuredOutput: true, streaming: true, longContext: true,
      coding: true, reasoning: true,
    };
  }
}
