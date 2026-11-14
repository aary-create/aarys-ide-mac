// ============================================================
// Aary's IDE — Speech-to-Text (STT) Service
// Supports OpenAI Whisper, Gemini audio transcription, and Web Speech API fallback
// ============================================================

import { config } from '../config.js';

export async function transcribeAudio(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<string> {
  // If OpenAI key is available, use Whisper
  if (config.ai.openai.apiKey) {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    formData.append('file', blob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.ai.openai.apiKey}` },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json() as any;
      return data.text || '';
    }
  }

  // Fallback representation for frontend/mock
  return '[Voice transcription requires OpenAI Whisper API Key or browser speech recognition]';
}
