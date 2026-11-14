// ============================================================
// Aary's IDE — AI Provider Base Adapter
// ============================================================

import type {
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIModel,
  ModelCapabilities,
} from '@aarys-ide/shared';

export interface AIAdapter {
  readonly type: string;
  readonly name: string;

  /** Test if the connection works */
  testConnection(apiKey: string, baseUrl?: string): Promise<boolean>;

  /** List available models */
  listModels(apiKey: string, baseUrl?: string): Promise<AIModel[]>;

  /** Send a completion request */
  complete(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): Promise<AICompletionResponse>;

  /** Send a streaming completion request */
  stream(
    request: AICompletionRequest,
    apiKey: string,
    baseUrl?: string
  ): AsyncGenerator<AIStreamChunk>;

  /** Detect capabilities of a specific model */
  detectCapabilities(modelId: string): ModelCapabilities;
}

/** Helper to make HTTP requests to AI APIs */
export async function fetchAI(
  url: string,
  body: unknown,
  apiKey: string,
  headers?: Record<string, string>
): Promise<Response> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`AI API error (${res.status}): ${error}`);
  }
  return res;
}

/** Parse SSE stream lines into chunks */
export async function* parseSSEStream(
  response: Response
): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('data: ')) {
        const data = trimmed.slice(6);
        if (data === '[DONE]') return;
        yield data;
      }
    }
  }
}
