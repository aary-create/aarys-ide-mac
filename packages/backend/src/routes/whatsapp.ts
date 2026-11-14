// ============================================================
// Aary's IDE — WhatsApp Webhook & Messaging Routes
// ============================================================

import { Router } from 'express';
import { config } from '../config.js';
import { handleWhatsAppWebhook } from '../integrations/whatsapp/webhook.js';
import { WhatsAppClient } from '../integrations/whatsapp/client.js';

export const whatsappRouter = Router();

whatsappRouter.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

whatsappRouter.post('/webhook', async (req, res) => {
  const client = config.whatsapp.accessToken
    ? new WhatsAppClient(config.whatsapp.phoneNumberId, config.whatsapp.accessToken)
    : undefined;

  await handleWhatsAppWebhook(req.body, 'default_user', client);
  res.sendStatus(200);
});

whatsappRouter.get('/status', (_req, res) => {
  res.json({
    success: true,
    data: {
      configured: Boolean(config.whatsapp.accessToken && config.whatsapp.phoneNumberId),
      phoneNumberId: config.whatsapp.phoneNumberId,
      webhookConfigured: Boolean(config.whatsapp.webhookUrl),
    },
  });
});
