// ============================================================
// Aary's IDE — JWT Session Management
// Token creation, validation, and refresh
// ============================================================

import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { query, queryOne, execute } from '../database.js';
import { generateId } from '@aarys-ide/shared';
import type { Request, Response, NextFunction } from 'express';

export interface JWTPayload {
  userId: string;
  email: string;
  sessionId: string;
  deviceId?: string;
}

/**
 * Create a new JWT token pair (access + refresh).
 */
export function createTokens(payload: Omit<JWTPayload, 'sessionId'>): {
  token: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: string;
} {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = jwt.sign(
    { ...payload, sessionId } satisfies JWTPayload,
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId, sessionId, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: '30d' }
  );

  // Persist the session in DB
  execute(
    `INSERT INTO sessions (id, user_id, token, refresh_token, device_id, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, payload.userId, token, refreshToken, payload.deviceId || null, expiresAt.toISOString()]
  );

  return { token, refreshToken, sessionId, expiresAt: expiresAt.toISOString() };
}

/**
 * Verify a JWT token and return the payload.
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
    // Verify the session still exists in DB
    const session = queryOne<{ id: string }>(
      'SELECT id FROM sessions WHERE id = ? AND token = ?',
      [payload.sessionId, token]
    );
    if (!session) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Refresh an access token using a refresh token.
 */
export function refreshAccessToken(refreshToken: string): {
  token: string;
  expiresAt: string;
} | null {
  try {
    const payload = jwt.verify(refreshToken, config.jwtSecret) as {
      userId: string;
      sessionId: string;
      type: string;
    };
    if (payload.type !== 'refresh') return null;

    // Check session exists
    const session = queryOne<{ id: string; user_id: string; device_id: string }>(
      'SELECT id, user_id, device_id FROM sessions WHERE id = ? AND refresh_token = ?',
      [payload.sessionId, refreshToken]
    );
    if (!session) return null;

    // Get user
    const user = queryOne<{ email: string }>(
      'SELECT email FROM users WHERE id = ?',
      [session.user_id]
    );
    if (!user) return null;

    const newToken = jwt.sign(
      {
        userId: session.user_id,
        email: user.email,
        sessionId: payload.sessionId,
        deviceId: session.device_id,
      } satisfies JWTPayload,
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Update the stored token
    execute(
      'UPDATE sessions SET token = ? WHERE id = ?',
      [newToken, payload.sessionId]
    );

    return { token: newToken, expiresAt };
  } catch {
    return null;
  }
}

/**
 * Invalidate a session (logout).
 */
export function invalidateSession(sessionId: string): void {
  execute('DELETE FROM sessions WHERE id = ?', [sessionId]);
}

/**
 * Invalidate all sessions for a user.
 */
export function invalidateAllSessions(userId: string): void {
  execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
}

/**
 * Express middleware: Authenticate request via Bearer token.
 * Attaches `req.user` with userId/email/sessionId.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' },
    });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
    });
    return;
  }

  // Attach user info to request
  (req as any).user = payload;
  next();
}

/**
 * Optional auth middleware: Extracts user if token present, but doesn't block.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      (req as any).user = payload;
    }
  }
  next();
}

// Clean up expired sessions periodically
export function cleanupExpiredSessions(): void {
  const now = new Date().toISOString();
  const result = execute('DELETE FROM sessions WHERE expires_at < ?', [now]);
  if (result.changes > 0) {
    console.log(`[Auth] Cleaned up ${result.changes} expired sessions`);
  }
}
