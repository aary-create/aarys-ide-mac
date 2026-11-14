// ============================================================
// Aary's IDE — Google OAuth
// Real Google OAuth2 flow implementation
// ============================================================

import { config } from '../config.js';
import { queryOne, execute } from '../database.js';
import { generateId } from '@aarys-ide/shared';
import { createTokens } from './session.js';
import { encryptCredential } from './credentials.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Scopes for Google OAuth
const SCOPES = [
  'openid',
  'email',
  'profile',
].join(' ');

/**
 * Generate the Google OAuth consent URL.
 */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    ...(state ? { state } : {}),
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeGoogleCode(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn: number;
}> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const data = await response.json() as any;
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    idToken: data.id_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Get the user's Google profile using an access token.
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
}> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  const data = await response.json() as any;
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * Full Google OAuth callback handler:
 * Exchange code → get user info → create or find user → create session.
 */
export async function handleGoogleCallback(code: string, deviceId?: string): Promise<{
  token: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
  };
}> {
  // 1. Exchange code for tokens
  const tokens = await exchangeGoogleCode(code);

  // 2. Get user info
  const googleUser = await getGoogleUserInfo(tokens.accessToken);

  // 3. Find or create user
  let user = queryOne<{
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  }>('SELECT id, email, name, avatar_url FROM users WHERE google_id = ? OR email = ?', [
    googleUser.id,
    googleUser.email,
  ]);

  if (!user) {
    const userId = generateId();
    const defaultSettings = JSON.stringify({
      theme: 'system',
      language: 'en',
      memoryEnabled: true,
      notificationsEnabled: true,
    });

    execute(
      `INSERT INTO users (id, email, name, avatar_url, provider, google_id, settings)
       VALUES (?, ?, ?, ?, 'google', ?, ?)`,
      [userId, googleUser.email, googleUser.name, googleUser.picture || null, googleUser.id, defaultSettings]
    );

    user = { id: userId, email: googleUser.email, name: googleUser.name, avatar_url: googleUser.picture || '' };
  } else {
    // Update google_id if missing and avatar
    execute(
      'UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(?, avatar_url), updated_at = datetime("now") WHERE id = ?',
      [googleUser.id, googleUser.picture, user.id]
    );
  }

  // 4. Store Google connection with encrypted tokens
  const connectionId = generateId();
  const encryptedConfig = encryptCredential(JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn,
  }));

  // Upsert connection
  const existing = queryOne<{ id: string }>(
    'SELECT id FROM connections WHERE user_id = ? AND type = ?',
    [user.id, 'google']
  );
  if (existing) {
    execute(
      `UPDATE connections SET config_encrypted = ?, status = 'connected', connected_at = datetime('now'), error = NULL WHERE id = ?`,
      [encryptedConfig, existing.id]
    );
  } else {
    execute(
      `INSERT INTO connections (id, user_id, type, name, config_encrypted, status, connected_at)
       VALUES (?, ?, 'google', 'Google Account', ?, 'connected', datetime('now'))`,
      [connectionId, user.id, encryptedConfig]
    );
  }

  // 5. Create session
  const session = createTokens({
    userId: user.id,
    email: user.email,
    deviceId,
  });

  return {
    ...session,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
    },
  };
}
