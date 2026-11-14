// ============================================================
// Aary's IDE — Speech Routes
// ============================================================

import { Router } from 'express';
import { transcribeAudio } from '../speech/stt.js';
import { synthesizeSpeech } from '../speech/tts.js';

export const speechRouter = Router();

speechRouter.post('/transcribe', async (req, res) => {
  try {
    const text = await transcribeAudio(Buffer.from(req.body.audio || '', 'base64'), req.body.mimeType);
    res.json({ success: true, data: { text } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

speechRouter.post('/synthesize', async (req, res) => {
  try {
    const audio = await synthesizeSpeech(req.body.text, req.body.voice);
    res.json({ success: true, data: { audioBase64: audio.toString('base64') } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
