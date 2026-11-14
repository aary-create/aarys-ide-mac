// ============================================================
// Aary's IDE — Backend Configuration
// Centralized environment configuration
// ============================================================

import dotenv from 'dotenv';
dotenv.config();

function env(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function envInt(key: string, fallback: number): number {
  const raw = process.env[key];
  return raw ? parseInt(raw, 10) : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (!raw) return fallback;
  return raw === 'true' || raw === '1';
}

export const config = {
  // Server
  port: envInt('PORT', 3001),
  host: env('HOST', '0.0.0.0'),
  nodeEnv: env('NODE_ENV', 'development'),
  isDev: env('NODE_ENV', 'development') === 'development',

  // Security
  jwtSecret: env('JWT_SECRET', 'change-me-to-a-random-secret-at-least-32-chars'),
  encryptionKey: env('ENCRYPTION_KEY', 'change-me-to-a-random-32-byte-hex-string'),
  allowedOrigins: env('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:3001').split(','),

  // Storage
  databasePath: env('DATABASE_PATH', './data/aary.db'),
  memoryPath: env('MEMORY_PATH', './data/memory'),
  workspacePath: env('WORKSPACE_PATH', './data/workspaces'),

  // AI Providers
  ai: {
    omniroute: {
      apiKey: process.env.OMNIROUTE_API_KEY || '',
      baseUrl: env('OMNIROUTE_BASE_URL', 'https://api.omniroute.ai/v1'),
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: 'https://api.openai.com/v1',
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      baseUrl: 'https://api.anthropic.com',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      baseUrl: 'https://generativelanguage.googleapis.com',
    },
    ollama: {
      baseUrl: env('OLLAMA_BASE_URL', 'http://localhost:11434'),
    },
    custom: {
      apiKey: process.env.CUSTOM_AI_API_KEY || '',
      baseUrl: process.env.CUSTOM_AI_BASE_URL || '',
    },
  },

  // OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: env('GOOGLE_REDIRECT_URI', 'http://localhost:3001/auth/google/callback'),
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    redirectUri: env('GITHUB_REDIRECT_URI', 'http://localhost:3001/auth/github/callback'),
  },

  // WhatsApp
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: env('WHATSAPP_VERIFY_TOKEN', 'change-me-to-a-random-string'),
    webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || '',
  },
} as const;

export type Config = typeof config;
