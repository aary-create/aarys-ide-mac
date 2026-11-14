// ============================================================
// Aary's IDE — Anthropic Adapter
// Real API calls to api.anthropic.com
// ============================================================

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  ModelCapabilities,
} from '@aarys-ide/shared';
import { type AIAdapter, parseSSEStream } from './base.js';

export class AnthropicAdapter implements AIAdapter {
  readonly type = 'anthropic';
  readonly name = 'Anthropic';

  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || 'https://api.anthropic.com'}/v1/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }],
      }),
    });
    return res.ok;
  }

  async listModels(apiKey: string, _baseUrl?: string): Promise<AIModel[]> {
    // Anthropic doesn't have a list models endpoint; return known models
    const models = [
      'claude-opus-4-20250514',
      'claude-sonnet-4-20250514',
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
    ];
    return models.map(id => ({
      id,
      name: id.replace(/-\d{8}$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      providerId: 'anthropic',
      capabilities: this.detectCapabilities(id),
    }));
  }

  async complete(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<AICompletionResponse> {
    const url = `${baseUrl || 'https://api.anthropic.com'}/v1/messages`;

    // Convert messages from OpenAI format to Anthropic format
    const systemMsg = request.messages.find(m => m.role === 'system');
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'tool' ? 'user' as const : m.role as 'user' | 'assistant',
        content: m.role === 'tool'
          ? [{ type: 'tool_result' as const, tool_use_id: m.toolCallId || '', content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
          : typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }));

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      messages,
    };
    if (systemMsg) {
      body.system = typeof systemMsg.content === 'string' ? systemMsg.content : '';
    }
    if (request.tools?.length) {
      body.tools = request.tools.map(t => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${err}`);
    }
    const data = await res.json() as any;

    const textBlocks = data.content.filter((b: any) => b.type === 'text');
    const toolBlocks = data.content.filter((b: any) => b.type === 'tool_use');

    return {
      id: data.id,
      model: data.model,
      content: textBlocks.map((b: any) => b.text).join(''),
      toolCalls: toolBlocks.length > 0 ? toolBlocks.map((b: any) => ({
        id: b.id,
        type: 'function' as const,
        function: { name: b.name, arguments: JSON.stringify(b.input) },
      })) : undefined,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      finishReason: data.stop_reason === 'tool_use' ? 'tool_calls' : 'stop',
    };
  }

  async *stream(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): AsyncGenerator<AIStreamChunk> {
    const url = `${baseUrl || 'https://api.anthropic.com'}/v1/messages`;
    const systemMsg = request.messages.find(m => m.role === 'system');
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }));

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      messages,
      stream: true,
    };
    if (systemMsg) body.system = typeof systemMsg.content === 'string' ? systemMsg.content : '';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Anthropic stream error: ${res.status}`);

    for await (const line of parseSSEStream(res)) {
      try {
        const evt = JSON.parse(line);
        if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
          yield {
            id: '',
            delta: { content: evt.delta.text },
          };
        }
      } catch { /* skip */ }
    }
  }

  detectCapabilities(modelId: string): ModelCapabilities {
    const isOpus = modelId.includes('opus');
    const isSonnet = modelId.includes('sonnet');
    return {
      toolCalling: true,
      vision: true,
      audio: false,
      speech: false,
      structuredOutput: true,
      streaming: true,
      longContext: true,
      coding: true,
      reasoning: isOpus || isSonnet,
      maxContextTokens: 200000,
    };
  }
}
