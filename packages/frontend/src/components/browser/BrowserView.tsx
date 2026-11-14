// ============================================================
// Aary's IDE — Browser View
// Web navigation, research agent, web extraction
// ============================================================

import React, { useState } from 'react';
import { Compass, ArrowRight, ExternalLink, Globe } from 'lucide-react';
import { Card, Button, Input } from '../ui/index.js';
import { apiRequest } from '../../api/client.js';

export const BrowserView: React.FC = () => {
  const [url, setUrl] = useState('https://google.com');
  const [loading, setLoading] = useState(false);

  const handleOpenBrowser = async () => {
    setLoading(true);
    try {
      await apiRequest('/tools/execute', {
        method: 'POST',
        body: JSON.stringify({ toolName: 'browser_open', args: { url } }),
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Browser Agent</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Research, navigate websites, fill forms, compare competitor systems, and extract data.
        </p>
      </div>

      <Card>
        <div className="flex items-center space-x-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="font-mono text-xs"
          />
          <Button size="sm" onClick={handleOpenBrowser} loading={loading}>
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Open
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Agent Research Capabilities" subtitle="Automated web analysis">
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pt-1">
            <li className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Full page text and DOM extraction</span>
            </li>
            <li className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Screenshot and visual comparison</span>
            </li>
            <li className="flex items-center space-x-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>Authentication & session persistence boundary respect</span>
            </li>
          </ul>
        </Card>

        <Card title="REA Integration" subtitle="Reverse Engineering Anything">
          <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 leading-relaxed">
            Integrated REA tool inspects native apps, Web bundles, and reverse-engineers product workflows directly into original implementations.
          </p>
        </Card>
      </div>
    </div>
  );
};
