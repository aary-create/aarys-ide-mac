// ============================================================
// Aary's IDE — Frontend WebSocket Client
// ============================================================

import type { WSMessage } from '@aarys-ide/shared';

type Handler = (payload: any) => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<Handler>>();
  private reconnectTimer: any = null;

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.ws = new WebSocket(`${protocol}//${host}`);

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        const set = this.handlers.get(msg.type);
        if (set) {
          set.forEach((h) => h(msg.payload));
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    this.ws.onclose = () => {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: new Date().toISOString() }));
    }
  }

  on(type: string, handler: Handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }
}

export const wsClient = new WebSocketClient();
