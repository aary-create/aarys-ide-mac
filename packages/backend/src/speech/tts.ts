// ============================================================
// Aary's IDE — Text-to-Speech (TTS) Service
// ============================================================

import { config } from '../config.js';

export async function synthesizeSpeech(text: string, voice = 'alloy'): Promise<Buffer> {
  if (config.ai.openai.apiKey) {
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.ai.openai.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: text,
        voice,
      }),
    });

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }
  }

  // Return empty buffer if no external TTS is configured; client-side speechSynthesis is used
  return Buffer.from([]);
}
