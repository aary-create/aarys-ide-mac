// ============================================================
// Aary's IDE — Express Server
// Main Express application with middleware and routes
// ============================================================

import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config.js';
import type { APIResponse } from '@aarys-ide/shared';

// Route imports
import { agentRouter } from './routes/agent.js';
import { aiRouter } from './routes/ai.js';
import { authRouter } from './routes/auth.js';
import { connectionsRouter } from './routes/connections.js';
import { memoryRouter } from './routes/memory.js';
import { projectsRouter } from './routes/projects.js';
import { tasksRouter } from './routes/tasks.js';
import { toolsRouter } from './routes/tools.js';
import { filesRouter } from './routes/files.js';
import { workspaceRouter } from './routes/workspace.js';
import { whatsappRouter } from './routes/whatsapp.js';
import { speechRouter } from './routes/speech.js';
import { devicesRouter } from './routes/devices.js';

export function createApp(): express.Application {
  const app = express();

  // ── Security middleware ──
  app.use(helmet({
    contentSecurityPolicy: config.isDev ? false : undefined,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ── CORS ──
  app.use(cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id', 'X-Session-Id'],
  }));

  // ── Compression ──
  app.use(compression());

  // ── Logging ──
  app.use(morgan(config.isDev ? 'dev' : 'combined'));

  // ── Body parsing ──
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ── Health check ──
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    } satisfies APIResponse);
  });

  // ── API Routes ──
  app.use('/api/agent', agentRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/connections', connectionsRouter);
  app.use('/api/memory', memoryRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/tools', toolsRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/workspace', workspaceRouter);
  app.use('/api/whatsapp', whatsappRouter);
  app.use('/api/speech', speechRouter);
  app.use('/api/devices', devicesRouter);

  // ── 404 handler ──
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
    } satisfies APIResponse);
  });

  // ── Global error handler ──
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: (err as any).code || 'INTERNAL_ERROR',
        message: config.isDev ? err.message : 'Internal server error',
        details: config.isDev ? err.stack : undefined,
      },
    } satisfies APIResponse);
  });

  return app;
}
