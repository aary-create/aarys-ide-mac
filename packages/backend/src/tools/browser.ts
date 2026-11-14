// ============================================================
// Aary's IDE — Browser Automation Tool
// ============================================================

import { registerTool } from './registry.js';
import { spawn } from 'child_process';

registerTool({
  name: 'browser_open', category: 'browser',
  description: 'Open a URL in the default browser.',
  parameters: { url: { type: 'string', description: 'URL to open', required: true } },
  requiredPermissions: ['browser.open'], requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const url = args.url as string;
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, [url], { detached: true, stdio: 'ignore' });
    child.unref();
    child.on('error', reject);
    resolve({ opened: url });
  });
});

registerTool({
  name: 'browser_search', category: 'browser',
  description: 'Search the web for a query.',
  parameters: { query: { type: 'string', description: 'Search query', required: true } },
  requiredPermissions: ['browser.open'], requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const query = encodeURIComponent(args.query as string);
  const url = `https://www.google.com/search?q=${query}`;
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(cmd, [url], { detached: true, stdio: 'ignore' }).unref();
  return { searchUrl: url, query: args.query };
});
