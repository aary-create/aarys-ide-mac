// ============================================================
// Aary's IDE — Custom OpenAI-Compatible Adapter
// ============================================================

import type { AIModel, ModelCapabilities } from '@aarys-ide/shared';
import { OpenAIAdapter } from './openai.js';

export class CustomAdapter extends OpenAIAdapter {
  override readonly type = 'custom';
  override readonly name = 'Custom API';

  override async listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    if (!baseUrl) return [];
    try {
      const models = await super.listModels(apiKey, baseUrl);
      return models.map(m => ({ ...m, providerId: 'custom' }));
    } catch {
      return [{ id: 'default', name: 'Default Model', providerId: 'custom', capabilities: this.detectCapabilities('default') }];
    }
  }

  override detectCapabilities(_modelId: string): ModelCapabilities {
    return {
      toolCalling: true, vision: false, audio: false, speech: false,
      structuredOutput: true, streaming: true, longContext: false,
      coding: true, reasoning: false,
    };
  }
}
