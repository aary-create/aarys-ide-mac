// ============================================================
// Aary's IDE — Browser Automation Controller
// ============================================================

import { spawn } from 'child_process';

export class BrowserController {
  static async open(url: string): Promise<boolean> {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    return new Promise((resolve) => {
      const child = spawn(cmd, [url], { detached: true, stdio: 'ignore' });
      child.unref();
      child.on('error', () => resolve(false));
      resolve(true);
    });
  }

  static async fetchContent(url: string): Promise<{ title: string; text: string }> {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AaryAgent/1.0)' },
      });
      const html = await res.text();
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : url;
      // Strip tags simple approximation
      const text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 15000);

      return { title, text };
    } catch (err: any) {
      throw new Error(`Failed to fetch page: ${err.message}`);
    }
  }
}
