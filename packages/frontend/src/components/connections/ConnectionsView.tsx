// ============================================================
// Aary's IDE — Connections & Universal Integrations
// Connect AI, GitHub, Google, WhatsApp, OpenCode, Hermes
// ============================================================

import React, { useEffect, useState } from 'react';
import { Cpu, Github, Mail, MessageCircle, Terminal, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, Button, Input, Badge } from '../ui/index.js';
import { useConnectionStore } from '../../stores/useConnectionStore.js';
import { apiRequest } from '../../api/client.js';

export const ConnectionsView: React.FC = () => {
  const { providers, loadAll, addAIProvider, testAIProvider } = useConnectionStore();

  const [aiType, setAiType] = useState('openai');
  const [aiName, setAiName] = useState('OpenAI');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const handleConnectAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey && aiType !== 'ollama') return;
    try {
      await addAIProvider({
        type: aiType,
        name: aiName,
        apiKey,
        baseUrl: baseUrl || undefined,
      });
      setApiKey('');
      alert('AI Provider added successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await testAIProvider(id);
      if (res.connected) alert('Connection successful!');
      else alert(`Connection test failed: ${res.error}`);
    } catch (err: any) {
      alert(`Test error: ${err.message}`);
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Universal Connections</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Connect your AI providers, cloud accounts, WhatsApp gateway, and coding subagents.
        </p>
      </div>

      {/* Prominent Connect AI Section */}
      <Card title="Connect AI Provider" subtitle="OmniRoute, OpenRouter, OpenAI, Anthropic, Gemini, Ollama, Custom">
        <form onSubmit={handleConnectAI} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Provider</label>
              <select
                value={aiType}
                onChange={(e) => {
                  setAiType(e.target.value);
                  setAiName(e.target.options[e.target.selectedIndex].text);
                }}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="omniroute">OmniRoute</option>
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="gemini">Google Gemini</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="custom">Custom Endpoint</option>
              </select>
            </div>

            <Input
              label="Connection Name"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="e.g. Production OpenAI"
            />

            <Input
              label="API Key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />

            <Input
              label="Base URL (Optional)"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm" className="px-5">
              Connect Provider
            </Button>
          </div>
        </form>
      </Card>

      {/* Connected AI Providers list */}
      <Card title="Connected Providers" subtitle="Active models available to central runtime">
        <div className="space-y-2 pt-2">
          {providers.length === 0 ? (
            <p className="text-xs text-slate-400 py-3 text-center">No AI providers connected yet. Add one above.</p>
          ) : (
            providers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-lg">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Type: {p.type} • {p.models.length} models detected
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={p.connected ? 'success' : 'danger'}>
                    {p.connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleTest(p.id)}
                    loading={testingId === p.id}
                    className="text-xs h-7"
                  >
                    Test
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* External Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GitHub */}
        <Card title="GitHub OAuth" subtitle="Repository creation, push, and PR agent">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <Github className="w-5 h-5 text-slate-900 dark:text-white" />
              <span>Connect GitHub Account</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => window.open('/api/auth/github', '_blank')}>
              Connect GitHub
            </Button>
          </div>
        </Card>

        {/* Google */}
        <Card title="Google Account" subtitle="Gmail, Drive, Docs, and Calendar">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="w-5 h-5 text-rose-500" />
              <span>Connect Google Services</span>
            </div>
            <Button size="sm" variant="secondary" onClick={() => window.open('/api/auth/google', '_blank')}>
              Connect Google
            </Button>
          </div>
        </Card>

        {/* WhatsApp Business Platform */}
        <Card title="WhatsApp Business API" subtitle="Official Meta Cloud API webhook gateway">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              <span>WhatsApp Webhook Ready</span>
            </div>
            <Badge variant="neutral">CONFIGURE IN .ENV</Badge>
          </div>
        </Card>

        {/* OpenCode & Hermes */}
        <Card title="Specialized Coding Agents" subtitle="OpenCode CLI & Hermes Agent delegations">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400">
              <Bot className="w-5 h-5 text-indigo-500" />
              <span>OpenCode & Hermes Delegations</span>
            </div>
            <Badge variant="success">AUTODETECTED</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
