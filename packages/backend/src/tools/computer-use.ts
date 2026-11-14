// ============================================================
// Aary's IDE — Computer Use Tool
// Screenshot, click, type, scroll via platform APIs
// ============================================================

import { registerTool } from './registry.js';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

registerTool({
  name: 'screenshot', category: 'computer_use',
  description: 'Capture a screenshot of the current screen.',
  parameters: {
    outputPath: { type: 'string', description: 'Path to save screenshot', required: false },
  },
  requiredPermissions: ['computer_use.screenshot'], requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const outputPath = (args.outputPath as string) || path.join(os.tmpdir(), `screenshot_${Date.now()}.png`);
  if (process.platform === 'darwin') {
    return new Promise((resolve, reject) => {
      const child = spawn('screencapture', ['-x', outputPath]);
      child.on('close', code => code === 0 ? resolve({ path: outputPath }) : reject(new Error('Screenshot failed')));
      child.on('error', reject);
    });
  } else if (process.platform === 'linux') {
    return new Promise((resolve, reject) => {
      const child = spawn('import', ['-window', 'root', outputPath]);
      child.on('close', code => code === 0 ? resolve({ path: outputPath }) : reject(new Error('Screenshot failed — is ImageMagick installed?')));
      child.on('error', reject);
    });
  } else {
    return new Promise((resolve, reject) => {
      const ps = `Add-Type -AssemblyName System.Windows.Forms;[System.Windows.Forms.Screen]::PrimaryScreen | ForEach-Object { $bmp = New-Object System.Drawing.Bitmap($_.Bounds.Width,$_.Bounds.Height);$g = [System.Drawing.Graphics]::FromImage($bmp);$g.CopyFromScreen($_.Bounds.Location,[System.Drawing.Point]::Empty,$_.Bounds.Size);$bmp.Save('${outputPath.replace(/\\/g, '\\\\')}') }`;
      const child = spawn('powershell', ['-Command', ps]);
      child.on('close', code => code === 0 ? resolve({ path: outputPath }) : reject(new Error('Screenshot failed')));
      child.on('error', reject);
    });
  }
});

registerTool({
  name: 'get_active_window', category: 'computer_use',
  description: 'Get information about the currently active window.',
  parameters: {},
  requiredPermissions: ['computer_use.observe'], requiresApproval: false,
  supportedPlatforms: ['macos', 'linux'],
}, async () => {
  if (process.platform === 'darwin') {
    return new Promise((resolve, reject) => {
      const script = `tell application "System Events" to get {name, title} of first application process whose frontmost is true`;
      const child = spawn('osascript', ['-e', script]);
      let stdout = '';
      child.stdout.on('data', d => { stdout += d; });
      child.on('close', () => resolve({ activeWindow: stdout.trim() }));
      child.on('error', reject);
    });
  }
  return { activeWindow: 'Unknown — platform not supported for this query' };
});
