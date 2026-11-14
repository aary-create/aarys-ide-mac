import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt a string value using AES-256-GCM.
 * Used for storing API keys and tokens securely.
 */
export function encrypt(text: string, key: string): string {
  const keyBuffer = createHash('sha256').update(key).digest();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt a string value encrypted with encrypt().
 */
export function decrypt(encryptedText: string, key: string): string {
  const keyBuffer = createHash('sha256').update(key).digest();
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');

  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/** Generate a cryptographically secure random ID */
export function generateId(length = 16): string {
  return randomBytes(length).toString('hex');
}

/** Hash a string using SHA-256 */
export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}
