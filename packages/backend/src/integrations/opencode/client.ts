// ============================================================
// Aary's IDE — OpenCode CLI Integration
// ============================================================

import { spawn } from 'child_process';

export class OpenCodeIntegration {
  static async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      const child = spawn('opencode', ['--version']);
      let output = '';
      child.stdout.on('data', (d) => { output += d.toString(); });
      child.on('close', (code) => {
        resolve({
          installed: code === 0,
          version: code === 0 ? output.trim() : undefined,
        });
      });
      child.on('error', () => resolve({ installed: false }));
    });
  }

  static async runTask(prompt: string, cwd: string): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const child = spawn('opencode', ['run', prompt], { cwd, timeout: 120000 });
      let output = '';
      child.stdout.on('data', (d) => { output += d.toString(); });
      child.stderr.on('data', (d) => { output += d.toString(); });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output.trim(),
        });
      });
      child.on('error', (err) => {
        resolve({ success: false, output: err.message });
      });
    });
  }
}
