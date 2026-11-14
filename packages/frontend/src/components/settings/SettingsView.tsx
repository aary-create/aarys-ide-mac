// ============================================================
// Aary's IDE — Settings View
// ============================================================

import React from 'react';
import { Sun, Moon, Shield, Key, Bell, Globe } from 'lucide-react';
import { Card, Button } from '../ui/index.js';
import { useAppStore } from '../../stores/useAppStore.js';

export const SettingsView: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Settings & Preferences</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure security, permissions, appearance, routing rules, and device pairing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Appearance */}
        <Card title="Appearance" subtitle="Customize theme and display">
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-700 dark:text-slate-300">Theme Mode</span>
            <Button size="sm" variant="secondary" onClick={toggleTheme}>
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 mr-1.5" /> Light Mode
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 mr-1.5" /> Dark Mode
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Security & Approvals */}
        <Card title="Security & Permissions" subtitle="Guardrails for autonomous actions">
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300">Require approval for git push</span>
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300">Require approval for deleting files</span>
              <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500" />
            </div>
          </div>
        </Card>

        {/* About */}
        <Card title="About Aary's IDE" subtitle="Universal AI Agent">
          <div className="space-y-1 pt-2 text-xs text-slate-500">
            <div>Version: 1.0.0 Production Release</div>
            <div>Architecture: Universal Agent Runtime (All Platforms)</div>
            <div>Storage: SQLite + AES-256 Encrypted Credential Vault</div>
          </div>
        </Card>
      </div>
    </div>
  );
};
