// ============================================================
// Aary's IDE — WhatsApp Webhook & Command Dispatcher
// Receives inbound messages and voice notes from WhatsApp
// ============================================================

import { processMessage } from '../../agent/runtime.js';
import { WhatsAppClient } from './client.js';
import { config } from '../../config.js';

export interface InboundWhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'audio' | 'voice' | 'image' | 'document';
  text?: { body: string };
  audio?: { id: string; mime_type: string };
}

export async function handleWhatsAppWebhook(
  body: any,
  systemUserId: string,
  client?: WhatsAppClient
): Promise<void> {
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message: InboundWhatsAppMessage | undefined = value?.messages?.[0];

  if (!message) return;

  const sender = message.from;
  let commandText = '';

  if (message.type === 'text' && message.text) {
    commandText = message.text.body;
  } else if (message.type === 'audio' || message.type === 'voice') {
    commandText = '[Voice note received: please process incoming task]';
  } else {
    commandText = `[Received ${message.type} attachment]`;
  }

  // Session ID derived from sender for continuity
  const sessionId = `wa_${sender}`;

  try {
    const response = await processMessage(sessionId, commandText);
    if (client && config.whatsapp.accessToken) {
      await client.sendTextMessage(sender, response.content);
    }
  } catch (err: any) {
    if (client && config.whatsapp.accessToken) {
      await client.sendTextMessage(sender, `Agent Error: ${err.message}`);
    }
  }
}
