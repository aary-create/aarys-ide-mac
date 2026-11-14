// ============================================================
// Aary's IDE — Server & WebSocket Entry Point
// ============================================================

import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createApp } from './server.js';
import { config } from './config.js';
import { processMessage, streamMessage } from './agent/runtime.js';
import type { WSMessage } from '@aarys-ide/shared';

const app = createApp();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', async (raw) => {
    try {
      const msg: WSMessage = JSON.parse(raw.toString());

      if (msg.type === 'agent:message') {
        const { sessionId, content } = msg.payload as { sessionId: string; content: string };

        // Stream or return agent responses
        for await (const chunk of streamMessage(sessionId, content, (state) => {
          ws.send(JSON.stringify({
            type: 'agent:state_change',
            payload: { state },
            timestamp: new Date().toISOString(),
          } satisfies WSMessage));
        })) {
          ws.send(JSON.stringify({
            type: 'agent:stream_chunk',
            payload: { content: chunk },
            timestamp: new Date().toISOString(),
          } satisfies WSMessage));
        }

        ws.send(JSON.stringify({
          type: 'agent:state_change',
          payload: { state: 'idle' },
          timestamp: new Date().toISOString(),
        } satisfies WSMessage));
      }
    } catch (err: any) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: err.message },
        timestamp: new Date().toISOString(),
      } satisfies WSMessage));
    }
  });

  ws.send(JSON.stringify({
    type: 'notification',
    payload: { title: 'Connected', message: "Aary's IDE Agent Runtime ready." },
    timestamp: new Date().toISOString(),
  } satisfies WSMessage));
});

server.listen(config.port, config.host, () => {
  console.log(`🚀 Aary's IDE Central Agent Runtime listening on http://${config.host}:${config.port}`);
});
