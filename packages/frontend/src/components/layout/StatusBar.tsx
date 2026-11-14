// ============================================================
// Aary's IDE — Status Bar
// Real-time task, device, memory & git indicators
// ============================================================

import React from 'react';
import { GitBranch, Activity, ShieldCheck, Wifi } from 'lucide-react';
import { useAgentStore } from '../../stores/useAgentStore.js';

export const StatusBar: React.FC = () => {
  const { state } = useAgentStore();

  return (
    <footer className="h-6 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-850 px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono select-none">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <GitBranch className="w-3 h-3 text-indigo-500" />
          <span>main</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="capitalize">{state}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Permissions: Standard</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Wifi className="w-3 h-3 text-indigo-500" />
          <span>Connected</span>
        </div>
      </div>
    </footer>
  );
};
