// ============================================================
// Aary's IDE — Hermes Agent Integration
// ============================================================

import { spawn } from 'child_process';

export class HermesIntegration {
  static async checkInstalled(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      const child = spawn('hermes', ['--version']);
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

  static async delegate(task: string, model?: string): Promise<{ success: boolean; result: string }> {
    return new Promise((resolve) => {
      const args = ['run', task];
      if (model) args.push('--model', model);

      const child = spawn('hermes', args, { timeout: 180000 });
      let output = '';
      child.stdout.on('data', (d) => { output += d.toString(); });
      child.stderr.on('data', (d) => { output += d.toString(); });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          result: output.trim(),
        });
      });
      child.on('error', (err) => {
        resolve({ success: false, result: err.message });
      });
    });
  }
}
