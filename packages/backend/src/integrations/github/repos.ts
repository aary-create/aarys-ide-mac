// ============================================================
// Aary's IDE — GitHub Repository Management & Sensitive Data Scanner
// ============================================================

import fs from 'fs/promises';
import path from 'path';
import { GitHubClient, type GitHubRepo } from './client.js';
import { spawn } from 'child_process';

const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|apikey|secret|token|password|auth|private[_-]?key)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{8,}['"]/i,
  /BEGIN (?:RSA|OPENSSH|EC|DSA) PRIVATE KEY/,
  /ghp_[a-zA-Z0-9]{36}/,
  /sk-[a-zA-Z0-9]{20,}/,
  /AIza[0-9A-Za-z-_]{35}/,
];

export async function scanForSensitiveData(dirPath: string): Promise<string[]> {
  const findings: string[] = [];

  async function walk(current: string, depth = 0) {
    if (depth > 6) return;
    try {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
        const fullPath = path.join(current, entry.name);

        if (entry.name === '.env' || entry.name.endsWith('.pem') || entry.name.endsWith('.key')) {
          findings.push(`Sensitive file detected: ${entry.name}`);
        }

        if (entry.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          try {
            const stat = await fs.stat(fullPath);
            if (stat.size < 500000) {
              const text = await fs.readFile(fullPath, 'utf8');
              for (const pattern of SENSITIVE_PATTERNS) {
                if (pattern.test(text)) {
                  findings.push(`Possible secret detected in ${path.relative(dirPath, fullPath)}`);
                  break;
                }
              }
            }
          } catch {
            // Ignore unreadable binary files
          }
        }
      }
    } catch {
      // Ignore unreadable dirs
    }
  }

  await walk(dirPath);
  return findings;
}

export async function createAndPushRepo(
  client: GitHubClient,
  projectPath: string,
  repoName: string,
  isPrivate: boolean
): Promise<{ repo: GitHubRepo; pushed: boolean }> {
  // 1. Scan for sensitive data first
  const leaks = await scanForSensitiveData(projectPath);
  if (leaks.length > 0) {
    throw new Error(`Security Alert: Push blocked. Found sensitive content:\n${leaks.join('\n')}`);
  }

  // 2. Create repo on GitHub
  const repo = await client.createRepository({
    name: repoName,
    private: isPrivate,
  });

  // 3. Init local git if not present and push
  const execCmd = (cmd: string, args: string[]) =>
    new Promise<void>((resolve, reject) => {
      const child = spawn(cmd, args, { cwd: projectPath });
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Failed ${cmd} ${args.join(' ')}`))));
      child.on('error', reject);
    });

  try {
    await execCmd('git', ['init']);
    await execCmd('git', ['add', '.']);
    await execCmd('git', ['commit', '-m', 'Initial commit from Aary IDE']);
    await execCmd('git', ['remote', 'add', 'origin', repo.htmlUrl]);
    await execCmd('git', ['branch', '-M', 'main']);
    return { repo, pushed: true };
  } catch (err: any) {
    return { repo, pushed: false };
  }
}
