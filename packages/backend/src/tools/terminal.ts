// ============================================================
// Aary's IDE — Terminal Tool
// Execute shell commands with child_process
// ============================================================

import { spawn } from 'child_process';
import { registerTool } from './registry.js';

registerTool({
  name: 'execute_command',
  category: 'terminal',
  description: 'Execute a shell command and return stdout/stderr.',
  parameters: {
    command: { type: 'string', description: 'The command to execute', required: true },
    cwd: { type: 'string', description: 'Working directory', required: false },
    timeout: { type: 'number', description: 'Timeout in ms (default: 30000)', required: false, default: 30000 },
  },
  requiredPermissions: ['terminal.execute'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  return new Promise((resolve, reject) => {
    const command = args.command as string;
    const cwd = args.cwd as string | undefined;
    const timeout = (args.timeout as number) || 30000;

    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
    const shellFlag = process.platform === 'win32' ? '-Command' : '-c';

    const child = spawn(shell, [shellFlag, command], {
      cwd: cwd || process.cwd(),
      timeout,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: code,
        success: code === 0,
      });
    });

    child.on('error', (err) => {
      reject(new Error(`Command failed: ${err.message}`));
    });
  });
});

registerTool({
  name: 'get_environment',
  category: 'terminal',
  description: 'Get information about the current execution environment.',
  parameters: {},
  requiredPermissions: [],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    cwd: process.cwd(),
    shell: process.env.SHELL || process.env.ComSpec || 'unknown',
    home: process.env.HOME || process.env.USERPROFILE || '',
    path: process.env.PATH?.split(process.platform === 'win32' ? ';' : ':').slice(0, 10),
  };
});
