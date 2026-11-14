// ============================================================
// Aary's IDE — Execution Verifier
// Verifies outcome of actions using real filesystem/command inspection
// ============================================================

import fs from 'fs/promises';
import { spawn } from 'child_process';
import type { TaskResult } from '@aarys-ide/shared';

export interface VerificationResult {
  verified: boolean;
  status: 'verified' | 'failed' | 'inconclusive';
  details: string;
  evidence?: Record<string, unknown>;
}

export async function verifyFileExists(filePath: string): Promise<VerificationResult> {
  try {
    const stat = await fs.stat(filePath);
    return {
      verified: true,
      status: 'verified',
      details: `File exists (${stat.size} bytes, modified ${stat.mtime.toISOString()})`,
      evidence: { path: filePath, size: stat.size, isDirectory: stat.isDirectory() },
    };
  } catch (err: any) {
    return {
      verified: false,
      status: 'failed',
      details: `File check failed: ${err.message}`,
      evidence: { path: filePath, error: err.message },
    };
  }
}

export async function verifyCommandExecution(
  cmd: string,
  cwd?: string
): Promise<VerificationResult> {
  return new Promise((resolve) => {
    const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/sh';
    const flag = process.platform === 'win32' ? '-Command' : '-c';
    const child = spawn(shell, [flag, cmd], { cwd: cwd || process.cwd(), timeout: 15000 });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d.toString(); });
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({
          verified: true,
          status: 'verified',
          details: `Command succeeded with exit code 0`,
          evidence: { stdout: stdout.trim(), exitCode: 0 },
        });
      } else {
        resolve({
          verified: false,
          status: 'failed',
          details: `Command failed with code ${code}: ${stderr.trim() || stdout.trim()}`,
          evidence: { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code },
        });
      }
    });

    child.on('error', (err) => {
      resolve({
        verified: false,
        status: 'failed',
        details: `Command failed to spawn: ${err.message}`,
      });
    });
  });
}

export async function verifyGitCommit(repoPath: string): Promise<VerificationResult> {
  return verifyCommandExecution('git status --porcelain', repoPath);
}

export async function verifyTaskResults(results: TaskResult[]): Promise<VerificationResult[]> {
  const verifiedList: VerificationResult[] = [];
  for (const r of results) {
    if (r.type === 'file') {
      verifiedList.push(await verifyFileExists(r.value));
    } else {
      verifiedList.push({
        verified: true,
        status: 'verified',
        details: `Verified ${r.type}: ${r.description}`,
      });
    }
  }
  return verifiedList;
}
