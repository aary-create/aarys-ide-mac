// ============================================================
// Aary's IDE — Google Gemini Adapter
// ============================================================

import type {
  AICompletionRequest, AICompletionResponse, AIStreamChunk, AIModel, ModelCapabilities,
} from '@aarys-ide/shared';
import { type AIAdapter, parseSSEStream } from './base.js';

export class GeminiAdapter implements AIAdapter {
  readonly type = 'gemini';
  readonly name = 'Google Gemini';

  async testConnection(apiKey: string, baseUrl?: string): Promise<boolean> {
    const url = `${baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    return res.ok;
  }

  async listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]> {
    const url = `${baseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gemini models error: ${res.statusText}`);
    const data = await res.json() as any;
    return (data.models || [])
      .filter((m: any) => m.name.includes('gemini'))
      .map((m: any) => ({
        id: m.name.replace('models/', ''),
        name: m.displayName || m.name,
        providerId: 'gemini',
        capabilities: this.detectCapabilities(m.name),
      }));
  }

  async complete(req: AICompletionRequest, apiKey: string, baseUrl?: string): Promise<AICompletionResponse> {
    const base = baseUrl || 'https://generativelanguage.googleapis.com';
    const url = `${base}/v1beta/models/${req.model}:generateContent?key=${apiKey}`;

    const systemInstruction = req.messages.find(m => m.role === 'system');
    const contents = req.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
      }));

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: typeof systemInstruction.content === 'string' ? systemInstruction.content : '' }] };
    }
    if (req.tools?.length) {
      body.tools = [{
        functionDeclarations: req.tools.map(t => ({
          name: t.function.name,
          description: t.function.description,
          parameters: t.function.parameters,
        })),
      }];
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini error (${res.status}): ${await res.text()}`);
    const data = await res.json() as any;
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const textParts = parts.filter((p: any) => p.text);
    const fnParts = parts.filter((p: any) => p.functionCall);

    return {
      id: `gemini-${Date.now()}`,
      model: req.model,
      content: textParts.map((p: any) => p.text).join(''),
      toolCalls: fnParts.length ? fnParts.map((p: any, i: number) => ({
        id: `call_${i}`,
        type: 'function' as const,
        function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args) },
      })) : undefined,
      usage: data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount || 0,
        completionTokens: data.usageMetadata.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata.totalTokenCount || 0,
      } : undefined,
      finishReason: fnParts.length ? 'tool_calls' : 'stop',
    };
  }

  async *stream(req: AICompletionRequest, apiKey: string, baseUrl?: string): AsyncGenerator<AIStreamChunk> {
    const base = baseUrl || 'https://generativelanguage.googleapis.com';
    const url = `${base}/v1beta/models/${req.model}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const contents = req.messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });
    if (!res.ok) throw new Error(`Gemini stream error: ${res.status}`);

    for await (const line of parseSSEStream(res)) {
      try {
        const data = JSON.parse(line);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield { id: `gemini-${Date.now()}`, delta: { content: text } };
      } catch { /* skip */ }
    }
  }

  detectCapabilities(modelId: string): ModelCapabilities {
    const isPro = modelId.includes('pro');
    return {
      toolCalling: true, vision: true, audio: modelId.includes('2.'),
      speech: false, structuredOutput: true, streaming: true,
      longContext: true, coding: true, reasoning: isPro,
      maxContextTokens: modelId.includes('2.') ? 2000000 : 1000000,
    };
  }
}
