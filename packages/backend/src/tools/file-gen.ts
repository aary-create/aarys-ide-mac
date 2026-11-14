// ============================================================
// Aary's IDE — File Generation Tool
// Generate code, documents, and other file types
// ============================================================

import { registerTool } from './registry.js';
import fs from 'fs/promises';
import path from 'path';

registerTool({
  name: 'generate_code', category: 'file_generation',
  description: 'Generate a code file with the given content and language.',
  parameters: {
    path: { type: 'string', description: 'File path to create', required: true },
    content: { type: 'string', description: 'Code content', required: true },
    language: { type: 'string', description: 'Programming language', required: false },
  },
  requiredPermissions: ['filesystem.write'], requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const filePath = args.path as string;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, args.content as string, 'utf-8');
  return { created: filePath, language: args.language || path.extname(filePath).slice(1) };
});

registerTool({
  name: 'generate_project', category: 'file_generation',
  description: 'Generate a complete project with multiple files.',
  parameters: {
    basePath: { type: 'string', description: 'Base directory for the project', required: true },
    files: { type: 'array', description: 'Array of {path, content} objects', required: true },
  },
  requiredPermissions: ['filesystem.write'], requiresApproval: false,
  supportedPlatforms: ['windows', 'macos', 'linux'],
}, async (args) => {
  const basePath = args.basePath as string;
  const files = args.files as Array<{ path: string; content: string }>;
  const created: string[] = [];
  for (const file of files) {
    const fullPath = path.join(basePath, file.path);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, file.content, 'utf-8');
    created.push(fullPath);
  }
  return { created, count: created.length };
});
