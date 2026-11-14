// ============================================================
// Aary's IDE — OpenAI Adapter
// Real API calls to api.openai.com
// ============================================================

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  ModelCapabilities,
} from '@aarys-ide/shared';
import { type AIAdapter, fetchAI, parseSSEStream } from './base.js';

export class OpenAIAdapter implements AIAdapter {
  readonly type: any = 'openai';
  readonly name: string = 'OpenAI';

  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || 'https://api.openai.com/v1'}/models`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return res.ok;
  }

  async listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    const url = `${baseUrl || 'https://api.openai.com/v1'}/models`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Failed to list models: ${res.statusText}`);
    const data = await res.json() as { data: Array<{ id: string; owned_by: string }> };

    return data.data
      .filter(m => m.id.startsWith('gpt-') || m.id.startsWith('o1') || m.id.startsWith('o3') || m.id.startsWith('o4'))
      .map(m => ({
        id: m.id,
        name: m.id,
        providerId: 'openai',
        capabilities: this.detectCapabilities(m.id),
      }));
  }

  async complete(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<AICompletionResponse> {
    const url = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: false,
    };
    if (request.tools?.length) {
      body.tools = request.tools;
    }
    if (request.responseFormat === 'json') {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetchAI(url, body, apiKey);
    const data = await res.json() as any;
    const choice = data.choices[0];

    return {
      id: data.id,
      model: data.model,
      content: choice.message.content || '',
      toolCalls: choice.message.tool_calls?.map((tc: any) => ({
        id: tc.id,
        type: 'function' as const,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
      finishReason: choice.finish_reason === 'tool_calls' ? 'tool_calls' : 'stop',
    };
  }

  async *stream(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): AsyncGenerator<AIStreamChunk> {
    const url = `${baseUrl || 'https://api.openai.com/v1'}/chat/completions`;
    const body: Record<string, unknown> = {
      model: request.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: true,
    };
    if (request.tools?.length) body.tools = request.tools;

    const res = await fetchAI(url, body, apiKey);

    for await (const line of parseSSEStream(res)) {
      try {
        const data = JSON.parse(line);
        const delta = data.choices?.[0]?.delta;
        if (!delta) continue;
        yield {
          id: data.id,
          delta: {
            content: delta.content || undefined,
            toolCalls: delta.tool_calls || undefined,
          },
          finishReason: data.choices[0].finish_reason || undefined,
        };
      } catch { /* skip invalid lines */ }
    }
  }

  detectCapabilities(modelId: string): ModelCapabilities {
    const isGPT4o = modelId.includes('gpt-4o');
    const isO1 = modelId.startsWith('o1') || modelId.startsWith('o3') || modelId.startsWith('o4');
    return {
      toolCalling: !isO1,
      vision: isGPT4o || modelId.includes('vision'),
      audio: isGPT4o,
      speech: false,
      structuredOutput: true,
      streaming: !isO1,
      longContext: true,
      coding: true,
      reasoning: isO1,
      maxContextTokens: isGPT4o ? 128000 : 128000,
    };
  }
}
