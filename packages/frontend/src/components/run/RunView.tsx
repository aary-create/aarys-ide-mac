// ============================================================
// Aary's IDE — Universal Run View
// Prominent execution trigger across devices, workspaces, runtimes
// ============================================================

import React, { useState } from 'react';
import { Play, Laptop, Globe, Server, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.js';
import { apiRequest } from '../../api/client.js';

export const RunView: React.FC = () => {
  const [target, setTarget] = useState<'local' | 'browser' | 'remote'>('local');
  const [output, setOutput] = useState<string>('Ready to run.');
  const [isRunning, setIsRunning] = useState(false);

  const handleExecute = async () => {
    setIsRunning(true);
    setOutput('Inspecting environment and running project...\n');
    try {
      const res = await apiRequest('/tools/execute', {
        method: 'POST',
        body: JSON.stringify({
          toolName: 'execute_command',
          args: { command: 'node -v && git status --short' },
        }),
      });

      setOutput(
        (prev) =>
          prev +
          `Execution Finished (Exit Code: ${res.result?.exitCode ?? 0})\nStdout:\n${res.result?.stdout || 'Success'}\n${
            res.result?.stderr ? `Stderr:\n${res.result.stderr}` : ''
          }`
      );
    } catch (err: any) {
      setOutput((prev) => prev + `\nExecution Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Universal Execution</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Select runtime target and trigger autonomous build, test, and run pipelines.
          </p>
        </div>

        {/* The Prominent Universal Run Button */}
        <Button
          size="lg"
          variant="primary"
          onClick={handleExecute}
          loading={isRunning}
          className="shadow-lg shadow-indigo-500/20 font-mono text-sm px-6 py-3"
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          RUN TASK
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setTarget('local')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            target === 'local'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-white mb-1">
            <Laptop className="w-4 h-4 text-indigo-500" />
            <span>This Device (Local)</span>
          </div>
          <p className="text-xs text-slate-500">Executes through local Node/Python/Native runtimes.</p>
        </div>

        <div
          onClick={() => setTarget('browser')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            target === 'browser'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-white mb-1">
            <Globe className="w-4 h-4 text-indigo-500" />
            <span>Browser Preview</span>
          </div>
          <p className="text-xs text-slate-500">Spins up local dev server and previews web applications.</p>
        </div>

        <div
          onClick={() => setTarget('remote')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            target === 'remote'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-900 dark:text-white mb-1">
            <Server className="w-4 h-4 text-indigo-500" />
            <span>Remote Workspace</span>
          </div>
          <p className="text-xs text-slate-500">Delegates build and test pipeline to remote SSH/cloud container.</p>
        </div>
      </div>

      <Card title="Live Terminal & Verification Log" subtitle="Real stdout/stderr verification output">
        <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 min-h-[220px] max-h-[400px] overflow-y-auto whitespace-pre-wrap">
          {output}
        </div>
      </Card>
    </div>
  );
};
