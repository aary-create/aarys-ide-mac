// ============================================================
// Aary's IDE — Google Services (Gmail, Drive, Calendar, Docs)
// ============================================================

import { GoogleApiClient } from './client.js';

export class GmailIntegration extends GoogleApiClient {
  async listMessages(query = '', maxResults = 10) {
    const q = encodeURIComponent(query);
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${q}`;
    return this.get<{ messages?: Array<{ id: string; threadId: string }> }>(url);
  }

  async getMessage(id: string) {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
    return this.get<any>(url);
  }

  async sendDraft(to: string, subject: string, bodyText: string) {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      bodyText,
    ].join('\r\n');

    const encoded = Buffer.from(message).toString('base64url');
    return this.post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      raw: encoded,
    });
  }
}

export class GoogleDriveIntegration extends GoogleApiClient {
  async listFiles(pageSize = 20) {
    const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,webViewLink,size)`;
    return this.get<{ files: Array<{ id: string; name: string; mimeType: string; webViewLink: string; size?: string }> }>(url);
  }

  async getFileMetadata(fileId: string) {
    return this.get<any>(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=*`);
  }
}

export class GoogleCalendarIntegration extends GoogleApiClient {
  async listEvents(timeMin?: string, maxResults = 20) {
    const min = encodeURIComponent(timeMin || new Date().toISOString());
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${min}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`;
    return this.get<{ items: Array<any> }>(url);
  }

  async createEvent(event: { summary: string; description?: string; start: { dateTime: string }; end: { dateTime: string } }) {
    return this.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', event);
  }
}

export class GoogleDocsIntegration extends GoogleApiClient {
  async getDocument(documentId: string) {
    return this.get<any>(`https://docs.googleapis.com/v1/documents/${documentId}`);
  }

  async createDocument(title: string) {
    return this.post<any>('https://docs.googleapis.com/v1/documents', { title });
  }
}
