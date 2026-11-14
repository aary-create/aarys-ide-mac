// ============================================================
// Aary's IDE — Ollama Adapter (Local AI)
// ============================================================

import type {
  AICompletionRequest, AICompletionResponse, AIStreamChunk, AIModel, ModelCapabilities,
} from '@aarys-ide/shared';
import type { AIAdapter } from './base.js';

export class OllamaAdapter implements AIAdapter {
  readonly type = 'ollama';
  readonly name = 'Ollama (Local)';

  async testConnection(_apiKey: string, baseUrl?: string): Promise<boolean> {
    try {
      const res = await fetch(`${baseUrl || 'http://localhost:11434'}/api/tags`);
      return res.ok;
    } catch { return false; }
  }

  async listModels(_apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    const res = await fetch(`${baseUrl || 'http://localhost:11434'}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json() as any;
    return (data.models || []).map((m: any) => ({
      id: m.name,
      name: m.name,
      providerId: 'ollama',
      capabilities: this.detectCapabilities(m.name),
    }));
  }

  async complete(req: AICompletionRequest, _apiKey: string, baseUrl?: string): Promise<AICompletionResponse> {
    const url = `${baseUrl || 'http://localhost:11434'}/api/chat`;
    const messages = req.messages.map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    }));
    const body: Record<string, unknown> = { model: req.model, messages, stream: false };
    if (req.tools?.length) {
      body.tools = req.tools.map(t => ({
        type: 'function',
        function: { name: t.function.name, description: t.function.description, parameters: t.function.parameters },
      }));
    }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
    const data = await res.json() as any;
    return {
      id: `ollama-${Date.now()}`,
      model: req.model,
      content: data.message?.content || '',
      toolCalls: data.message?.tool_calls?.map((tc: any, i: number) => ({
        id: `call_${i}`, type: 'function' as const,
        function: { name: tc.function.name, arguments: JSON.stringify(tc.function.arguments) },
      })),
      finishReason: data.message?.tool_calls?.length ? 'tool_calls' : 'stop',
    };
  }

  async *stream(req: AICompletionRequest, _apiKey: string, baseUrl?: string): AsyncGenerator<AIStreamChunk> {
    const url = `${baseUrl || 'http://localhost:11434'}/api/chat`;
    const messages = req.messages.map(m => ({
      role: m.role, content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    }));
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: req.model, messages, stream: true }),
    });
    if (!res.ok) throw new Error(`Ollama stream error: ${res.statusText}`);
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) {
            yield { id: `ollama-${Date.now()}`, delta: { content: data.message.content } };
          }
        } catch { /* skip */ }
      }
    }
  }

  detectCapabilities(modelId: string): ModelCapabilities {
    const hasVision = modelId.includes('llava') || modelId.includes('vision');
    return {
      toolCalling: modelId.includes('llama') || modelId.includes('mistral') || modelId.includes('qwen'),
      vision: hasVision, audio: false, speech: false, structuredOutput: true,
      streaming: true, longContext: false, coding: true, reasoning: false,
    };
  }
}
