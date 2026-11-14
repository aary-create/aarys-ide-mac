// ============================================================
// Aary's IDE — Agent Configuration & Execution State
// ============================================================

import React from 'react';
import { Bot, Cpu, ShieldCheck, CheckCircle2, Clock, Play } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore.js';
import { Card, Badge, Button } from '../ui/index.js';

export const AgentView: React.FC = () => {
  const { state, currentSession } = useAgentStore();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Central Agent Runtime</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Inspect execution loops, capabilities, pending approvals, and autonomous planning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Execution State" subtitle="Active runtime status">
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{state}</span>
            <Badge variant={state === 'idle' ? 'success' : 'info'}>{state.toUpperCase()}</Badge>
          </div>
        </Card>

        <Card title="Session" subtitle="Current conversation token scope">
          <div className="pt-2 text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
            {currentSession?.id || 'default_session'}
          </div>
        </Card>

        <Card title="Security Mode" subtitle="Authorization & sandbox">
          <div className="flex items-center space-x-1.5 pt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Local Execution</span>
          </div>
        </Card>
      </div>

      <Card title="Core Capabilities" subtitle="Autonomous tools granted to this runtime">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'Filesystem Ops', enabled: true },
            { label: 'Terminal Commands', enabled: true },
            { label: 'Git Remote Management', enabled: true },
            { label: 'Browser Automation', enabled: true },
            { label: 'Computer Use & Vision', enabled: true },
            { label: 'WhatsApp Gateway', enabled: true },
            { label: 'Speech Transcription', enabled: true },
            { label: 'Result Verification', enabled: true },
          ].map((cap, i) => (
            <div key={i} className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{cap.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
