// ============================================================
// Aary's IDE — Credential Storage
// Encrypted storage for API keys and tokens
// ============================================================

import { encrypt, decrypt } from '@aarys-ide/shared';
import { config } from '../config.js';

const key = config.encryptionKey;

/**
 * Encrypt a credential (API key, token, etc.) for storage.
 */
export function encryptCredential(plainText: string): string {
  return encrypt(plainText, key);
}

/**
 * Decrypt a stored credential.
 */
export function decryptCredential(cipherText: string): string {
  return decrypt(cipherText, key);
}

/**
 * Encrypt a JSON object for storage (e.g., config objects).
 */
export function encryptJson(obj: Record<string, unknown>): string {
  return encrypt(JSON.stringify(obj), key);
}

/**
 * Decrypt a stored JSON object.
 */
export function decryptJson<T = Record<string, unknown>>(cipherText: string): T {
  const decrypted = decrypt(cipherText, key);
  return JSON.parse(decrypted) as T;
}

/**
 * Mask an API key for display (show first/last 4 chars).
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 12) return '****';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}
