// ============================================================
// Aary's IDE — Local Workspace Engine
// ============================================================

import fs from 'fs/promises';
import path from 'path';
import type { WorkspaceFile, FileOperation } from '@aarys-ide/shared';

export class LocalWorkspace {
  private rootPath: string;

  constructor(rootPath: string) {
    this.rootPath = path.resolve(rootPath);
  }

  private resolveSafe(filePath: string): string {
    const full = path.resolve(this.rootPath, filePath);
    if (!full.startsWith(this.rootPath)) {
      throw new Error('Access denied: path outside workspace root');
    }
    return full;
  }

  async getFileTree(maxDepth = 4): Promise<WorkspaceFile[]> {
    const readDir = async (dir: string, depth: number): Promise<WorkspaceFile[]> => {
      if (depth > maxDepth) return [];
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const items: WorkspaceFile[] = [];

      for (const entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
        const full = path.join(dir, entry.name);
        const rel = path.relative(this.rootPath, full);

        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: rel,
            type: 'directory',
            children: await readDir(full, depth + 1),
          });
        } else {
          const stat = await fs.stat(full);
          items.push({
            name: entry.name,
            path: rel,
            type: 'file',
            size: stat.size,
            modifiedAt: stat.mtime.toISOString(),
          });
        }
      }
      return items;
    };

    return readDir(this.rootPath, 1);
  }

  async applyOperation(op: FileOperation): Promise<any> {
    const target = this.resolveSafe(op.path);

    switch (op.type) {
      case 'read':
        return fs.readFile(target, (op.encoding as BufferEncoding) || 'utf8');
      case 'create':
      case 'update':
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, op.content || '', 'utf8');
        return { success: true, path: op.path };
      case 'delete':
        await fs.rm(target, { recursive: true, force: true });
        return { success: true, deleted: op.path };
      case 'rename':
      case 'move':
        if (!op.newPath) throw new Error('Missing newPath');
        const dest = this.resolveSafe(op.newPath);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.rename(target, dest);
        return { success: true, from: op.path, to: op.newPath };
      default:
        throw new Error(`Unsupported operation: ${op.type}`);
    }
  }
}
