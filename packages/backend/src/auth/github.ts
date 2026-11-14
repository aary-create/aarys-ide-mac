// ============================================================
// Aary's IDE — GitHub OAuth
// Real GitHub OAuth2 flow implementation
// ============================================================

import { config } from '../config.js';
import { queryOne, execute } from '../database.js';
import { generateId } from '@aarys-ide/shared';
import { createTokens } from './session.js';
import { encryptCredential } from './credentials.js';

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

const SCOPES = 'user:email,repo,read:org';

/**
 * Generate the GitHub OAuth consent URL.
 */
export function getGitHubAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.redirectUri,
    scope: SCOPES,
    ...(state ? { state } : {}),
  });
  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token.
 */
export async function exchangeGitHubCode(code: string): Promise<{
  accessToken: string;
  tokenType: string;
  scope: string;
}> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
      redirect_uri: config.github.redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.statusText}`);
  }

  const data = await response.json() as any;
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

/**
 * Get the user's GitHub profile.
 */
export async function getGitHubUserInfo(accessToken: string): Promise<{
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatarUrl: string;
}> {
  const response = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch GitHub user info');
  }

  const data = await response.json() as any;

  // If email is not public, fetch from emails endpoint
  let email = data.email;
  if (!email) {
    const emailRes = await fetch(GITHUB_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    if (emailRes.ok) {
      const emails = await emailRes.json() as any[];
      const primary = emails.find((e: any) => e.primary) || emails[0];
      email = primary?.email || null;
    }
  }

  return {
    id: data.id,
    login: data.login,
    name: data.name || data.login,
    email,
    avatarUrl: data.avatar_url,
  };
}

/**
 * Full GitHub OAuth callback handler.
 */
export async function handleGitHubCallback(code: string, deviceId?: string): Promise<{
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
  const tokens = await exchangeGitHubCode(code);

  // 2. Get user info
  const githubUser = await getGitHubUserInfo(tokens.accessToken);

  if (!githubUser.email) {
    throw new Error('GitHub account has no associated email. Please add a public email to your GitHub profile.');
  }

  // 3. Find or create user
  let user = queryOne<{
    id: string;
    email: string;
    name: string;
    avatar_url: string;
  }>('SELECT id, email, name, avatar_url FROM users WHERE email = ?', [githubUser.email]);

  if (!user) {
    const userId = generateId();
    const defaultSettings = JSON.stringify({
      theme: 'system',
      language: 'en',
      memoryEnabled: true,
      notificationsEnabled: true,
    });

    execute(
      `INSERT INTO users (id, email, name, avatar_url, provider, settings)
       VALUES (?, ?, ?, ?, 'email', ?)`,
      [userId, githubUser.email, githubUser.name, githubUser.avatarUrl, defaultSettings]
    );

    user = { id: userId, email: githubUser.email, name: githubUser.name, avatar_url: githubUser.avatarUrl };
  }

  // 4. Store GitHub connection with encrypted tokens
  const encryptedConfig = encryptCredential(JSON.stringify({
    accessToken: tokens.accessToken,
    githubId: githubUser.id,
    username: githubUser.login,
    scope: tokens.scope,
  }));

  const existing = queryOne<{ id: string }>(
    'SELECT id FROM connections WHERE user_id = ? AND type = ?',
    [user.id, 'github']
  );
  if (existing) {
    execute(
      `UPDATE connections SET config_encrypted = ?, status = 'connected', connected_at = datetime('now'), error = NULL WHERE id = ?`,
      [encryptedConfig, existing.id]
    );
  } else {
    execute(
      `INSERT INTO connections (id, user_id, type, name, config_encrypted, status, connected_at)
       VALUES (?, ?, 'github', 'GitHub', ?, 'connected', datetime('now'))`,
      [generateId(), user.id, encryptedConfig]
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
