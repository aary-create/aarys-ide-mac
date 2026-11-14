/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a URL format.
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input to prevent injection.
 */
export function sanitize(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 100000); // Reasonable max length
}

/**
 * Validate API key format (non-empty, reasonable length).
 */
export function isValidApiKey(key: string): boolean {
  return typeof key === 'string' && key.length >= 8 && key.length <= 512;
}

/**
 * Check if a path is safe (no traversal attacks).
 */
export function isSafePath(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  return !normalized.includes('..') && !normalized.startsWith('/etc') && !normalized.startsWith('/proc');
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}
