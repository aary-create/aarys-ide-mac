// ============================================================
// Aary's IDE — WhatsApp Business API Client
// Official Meta WhatsApp Cloud API integration
// ============================================================

export interface WhatsAppMessagePayload {
  to: string;
  type: 'text' | 'audio' | 'document' | 'template';
  text?: string;
  mediaUrl?: string;
  caption?: string;
}

export class WhatsAppClient {
  private phoneNumberId: string;
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v20.0';

  constructor(phoneNumberId: string, accessToken: string) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  async sendTextMessage(to: string, message: string): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: message },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp API error (${res.status}): ${err}`);
    }
    return res.json();
  }

  async sendAudioMessage(to: string, audioUrl: string): Promise<any> {
    const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'audio',
        audio: { link: audioUrl },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`WhatsApp API error (${res.status}): ${err}`);
    }
    return res.json();
  }
}
