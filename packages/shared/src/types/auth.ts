// ============================================================
// Aary's IDE — Authentication Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  googleId?: string;
  createdAt: string;
  updatedAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  speechVoice?: string;
  speechSpeed?: number;
  defaultProviderId?: string;
  defaultModelId?: string;
  routingPreferences?: import('./ai-provider.js').RoutingPreferences;
  memoryEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface AuthSession {
  userId: string;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  deviceId: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  scope: string;
  tokenType: string;
}

export interface GitHubConnection {
  userId: string;
  githubId: string;
  username: string;
  avatarUrl?: string;
  token: OAuthToken;
  scopes: string[];
  connectedAt: string;
}

export interface GoogleConnection {
  userId: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  token: OAuthToken;
  services: GoogleServicePermission[];
  connectedAt: string;
}

export interface GoogleServicePermission {
  service: 'gmail' | 'drive' | 'calendar' | 'docs' | 'sheets';
  enabled: boolean;
  scope: string;
  authorizedAt?: string;
}
