// ============================================================
// Aary's IDE — Computer Use View
// ============================================================

import React, { useState } from 'react';
import { Monitor, Camera, Shield, Eye, Smartphone, Laptop } from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.js';
import { apiRequest } from '../../api/client.js';

export const ComputerView: React.FC = () => {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCaptureScreen = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/tools/execute', {
        method: 'POST',
        body: JSON.stringify({ toolName: 'screenshot', args: {} }),
      });
      if (res.result?.path) {
        setScreenshotUrl(res.result.path);
      }
    } catch (err: any) {
      alert(`Capture error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Computer Use & Devices</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorized screen observation, accessibility tree inspection, and native device interaction.
          </p>
        </div>
        <Button size="sm" onClick={handleCaptureScreen} loading={loading}>
          <Camera className="w-3.5 h-3.5 mr-1.5" />
          Capture Screen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Current Device" subtitle="Local system capabilities">
          <div className="flex items-center space-x-3 pt-2">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Host Computer (macOS/Unix)</div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">Status: Authorized • Active</div>
            </div>
          </div>
        </Card>

        <Card title="Security & Safety Guard" subtitle="Computer use guardrails">
          <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 pt-2 font-medium">
            <Shield className="w-4 h-4" />
            <span>Loop: Observe → Understand → Identify → Act → Verify</span>
          </div>
        </Card>
      </div>

      <Card title="Screen Observation" subtitle="Visual feedback for the agent">
        <div className="h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 p-6 text-center">
          {screenshotUrl ? (
            <div className="text-xs font-mono text-emerald-500">
              Screenshot captured at: {screenshotUrl}
            </div>
          ) : (
            <>
              <Eye className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No active screen capture session.</p>
              <p className="text-[11px] text-slate-500 mt-1">Press "Capture Screen" to observe current state.</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
