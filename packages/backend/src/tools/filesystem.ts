// ============================================================
// Aary's IDE — Filesystem Tools
// ============================================================

import fs from 'fs/promises';
import path from 'path';
import { registerTool } from './registry.js';
import { isSafePath } from '@aarys-ide/shared';

registerTool({
  name: 'read_file',
  category: 'filesystem',
  description: 'Read the contents of a file at the given path.',
  parameters: {
    path: { type: 'string', description: 'Absolute path to the file', required: true },
    encoding: { type: 'string', description: 'File encoding (default: utf-8)', required: false, default: 'utf-8' },
  },
  requiredPermissions: ['filesystem.read'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const filePath = args.path as string;
  if (!isSafePath(filePath)) throw new Error('Unsafe file path');
  return await fs.readFile(filePath, { encoding: (args.encoding as BufferEncoding) || 'utf-8' });
});

registerTool({
  name: 'write_file',
  category: 'filesystem',
  description: 'Write content to a file, creating it if it does not exist.',
  parameters: {
    path: { type: 'string', description: 'Absolute path to the file', required: true },
    content: { type: 'string', description: 'Content to write', required: true },
  },
  requiredPermissions: ['filesystem.write'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const filePath = args.path as string;
  if (!isSafePath(filePath)) throw new Error('Unsafe file path');
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, args.content as string, 'utf-8');
  return { written: filePath, size: (args.content as string).length };
});

registerTool({
  name: 'list_directory',
  category: 'filesystem',
  description: 'List files and directories in a given path.',
  parameters: {
    path: { type: 'string', description: 'Directory path to list', required: true },
    recursive: { type: 'boolean', description: 'List recursively', required: false, default: false },
  },
  requiredPermissions: ['filesystem.read'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const dirPath = args.path as string;
  if (!isSafePath(dirPath)) throw new Error('Unsafe path');
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries.map(e => ({
    name: e.name,
    type: e.isDirectory() ? 'directory' : 'file',
    path: path.join(dirPath, e.name),
  }));
});

registerTool({
  name: 'create_directory',
  category: 'filesystem',
  description: 'Create a directory (and parent directories if needed).',
  parameters: {
    path: { type: 'string', description: 'Directory path', required: true },
  },
  requiredPermissions: ['filesystem.write'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const dirPath = args.path as string;
  if (!isSafePath(dirPath)) throw new Error('Unsafe path');
  await fs.mkdir(dirPath, { recursive: true });
  return { created: dirPath };
});

registerTool({
  name: 'delete_file',
  category: 'filesystem',
  description: 'Delete a file or empty directory.',
  parameters: {
    path: { type: 'string', description: 'Path to delete', required: true },
  },
  requiredPermissions: ['filesystem.write'],
  requiresApproval: true,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const filePath = args.path as string;
  if (!isSafePath(filePath)) throw new Error('Unsafe path');
  await fs.rm(filePath, { recursive: false });
  return { deleted: filePath };
});

registerTool({
  name: 'search_files',
  category: 'filesystem',
  description: 'Search for files matching a pattern in a directory.',
  parameters: {
    directory: { type: 'string', description: 'Directory to search in', required: true },
    pattern: { type: 'string', description: 'File name pattern (glob-like)', required: true },
  },
  requiredPermissions: ['filesystem.read'],
  requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const dir = args.directory as string;
  const pattern = (args.pattern as string).toLowerCase();
  if (!isSafePath(dir)) throw new Error('Unsafe path');
  const results: string[] = [];
  async function walk(d: string, depth = 0) {
    if (depth > 5) return;
    try {
      const entries = await fs.readdir(d, { withFileTypes: true });
      for (const e of entries) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const full = path.join(d, e.name);
        if (e.isDirectory()) await walk(full, depth + 1);
        else if (e.name.toLowerCase().includes(pattern)) results.push(full);
      }
    } catch { /* skip inaccessible dirs */ }
  }
  await walk(dir);
  return results.slice(0, 100);
});
