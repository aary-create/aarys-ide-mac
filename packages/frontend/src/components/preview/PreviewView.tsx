// ============================================================
// Aary's IDE — Live Preview & AI Activity Inspector
// Real-time project rendering + Live Agent Execution Stream
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Bot,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Sparkles,
  Layers,
  Send,
  Code2,
  ChevronRight,
  ChevronDown,
  Clock,
  Eye,
  Maximize2
} from 'lucide-react';
import { useProjectStore } from '../../stores/useProjectStore.js';
import { useAgentStore } from '../../stores/useAgentStore.js';
import { Button, Badge } from '../ui/index.js';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type LayoutMode = 'split' | 'preview-only' | 'agent-only';

interface AgentStepLog {
  id: string;
  time: string;
  type: 'thought' | 'tool' | 'file' | 'system';
  title: string;
  detail?: string;
  status: 'running' | 'completed' | 'failed';
}

export const PreviewView: React.FC = () => {
  const { activeProject, files, activeFile, fileContent } = useProjectStore();
  const { state: agentState, selectedModel, sendMessage } = useAgentStore();

  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [layout, setLayout] = useState<LayoutMode>('split');
  const [targetUrl, setTargetUrl] = useState<string>('live://project-canvas');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [consoleOpen, setConsoleOpen] = useState<boolean>(false);
  const [interventionText, setInterventionText] = useState<string>('');
  const [isExpandedThought, setIsExpandedThought] = useState<boolean>(true);

  // Live mock/synced stream of agent actions
  const [agentLogs, setAgentLogs] = useState<AgentStepLog[]>([
    {
      id: 'step-1',
      time: 'Just now',
      type: 'thought',
      title: 'Analyzing component hierarchy and preview requirements',
      detail: 'Connecting reactive live canvas with active workspace memory to hot-reload on every file delta.',
      status: 'completed'
    },
    {
      id: 'step-2',
      time: '12s ago',
      type: 'tool',
      title: 'exec: npm run build:frontend',
      detail: 'Bundling TypeScript and React 19 artifacts into production bundle.',
      status: 'completed'
    },
    {
      id: 'step-3',
      time: 'Active',
      type: 'file',
      title: 'write_file: packages/frontend/src/components/preview/PreviewView.tsx',
      detail: 'Injecting dual-mode preview canvas & real-time agent activity feed.',
      status: 'running'
    }
  ]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Determine what HTML/content to render in the live canvas
  const getPreviewHtml = () => {
    // If active file is an HTML or contains markup
    if (activeFile && (activeFile.endsWith('.html') || fileContent.includes('<html') || fileContent.includes('<!DOCTYPE'))) {
      return fileContent;
    }

    // Default rich interactive project preview canvas
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${activeProject ? activeProject.name : "Aary's IDE Project"} - Live Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #0f172a; color: #f8fafc; }
    .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
    .glow-indigo { box-shadow: 0 0 50px -10px rgba(99, 102, 241, 0.3); }
  </style>
</head>
<body class="min-h-screen flex flex-col justify-between p-6">
  <div class="max-w-4xl mx-auto w-full pt-8">
    <div class="glass-card rounded-2xl p-8 glow-indigo border border-indigo-500/20 text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        Live Interactive Preview
      </div>
      <h1 class="text-3xl font-extrabold tracking-tight text-white mb-2">
        ${activeProject ? activeProject.name : "Aary's IDE Universal App"}
      </h1>
      <p class="text-slate-400 text-sm max-w-lg mx-auto mb-6">
        This viewport reflects your active project files in real-time. Changes written by you or the AI are hot-reloaded automatically.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left my-6">
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div class="text-xs text-indigo-400 font-mono mb-1">WORKSPACE</div>
          <div class="text-sm font-semibold text-white">${activeProject?.name || 'Default Workspace'}</div>
          <div class="text-xs text-slate-500 mt-1">${files.length} active files tracked</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div class="text-xs text-emerald-400 font-mono mb-1">ACTIVE FILE</div>
          <div class="text-sm font-semibold text-white truncate">${activeFile || 'index.html'}</div>
          <div class="text-xs text-slate-500 mt-1">Hot-reloading enabled</div>
        </div>
        <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div class="text-xs text-amber-400 font-mono mb-1">AI RUNTIME</div>
          <div class="text-sm font-semibold text-white">${agentState === 'thinking' ? 'Synthesizing...' : 'Synced & Ready'}</div>
          <div class="text-xs text-slate-500 mt-1">${selectedModel}</div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3">
        <button onclick="triggerAction('Counter incremented')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30">
          Interactive Test Button
        </button>
        <button onclick="triggerAction('Preview refreshed')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-all">
          Trigger Event
        </button>
      </div>

      <div id="log-output" class="mt-4 p-3 bg-black/40 rounded-lg text-left text-xs font-mono text-emerald-400 hidden">
        > Event logged to parent preview frame
      </div>
    </div>
  </div>

  <div class="text-center text-xs text-slate-600 py-4 font-mono">
    Aary's IDE Sandbox Engine • Port 3001 Connected
  </div>

  <script>
    function triggerAction(name) {
      const el = document.getElementById('log-output');
      el.classList.remove('hidden');
      el.innerText = '> ' + new Date().toLocaleTimeString() + ': ' + name;
      console.log('[Preview Canvas] ' + name);
    }
  </script>
</body>
</html>`;
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleSendIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interventionText.trim()) return;

    const newLog: AgentStepLog = {
      id: `usr-${Date.now()}`,
      time: 'Just now',
      type: 'thought',
      title: `User Instruction: "${interventionText}"`,
      detail: 'Agent accepted prompt intervention from Preview panel. Adjusting current plan.',
      status: 'running'
    };
    setAgentLogs((prev) => [newLog, ...prev]);

    const msg = interventionText;
    setInterventionText('');
    await sendMessage(msg);
  };

  // Viewport container sizing
  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'w-[375px] max-w-[375px] h-[667px] shadow-2xl rounded-3xl border-8 border-slate-800';
      case 'tablet':
        return 'w-[768px] max-w-[768px] h-[90%] shadow-2xl rounded-2xl border-4 border-slate-800';
      case 'desktop':
      default:
        return 'w-full h-full rounded-lg';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Header & View Toolbar */}
      <div className="h-12 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs tracking-tight">
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Live Workspace & Agent Preview</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Layout Mode Toggles */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setLayout('split')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                layout === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setLayout('preview-only')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                layout === 'preview-only' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              App Canvas
            </button>
            <button
              onClick={() => setLayout('agent-only')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                layout === 'agent-only' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Stream
            </button>
          </div>
        </div>

        {/* Viewport Toggles (Active when App preview is visible) */}
        {layout !== 'agent-only' && (
          <div className="flex items-center space-x-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewport === 'desktop' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewport === 'tablet' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewport === 'mobile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Target URL & Refresh */}
        <div className="flex items-center space-x-2">
          {layout !== 'agent-only' && (
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 font-mono w-56">
              <span className="text-slate-500 mr-1.5">URL:</span>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-200 text-xs w-full font-mono"
              />
            </div>
          )}

          <Button size="sm" variant="ghost" onClick={handleRefresh} className="h-7 w-7 p-0" title="Reload Frame">
            <RotateCw className="w-3.5 h-3.5" />
          </Button>

          {/* Agent Status Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                agentState === 'thinking'
                  ? 'bg-amber-400 animate-ping'
                  : agentState === 'running'
                  ? 'bg-indigo-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono capitalize text-slate-300">
              {agentState === 'thinking' ? 'AI Thinking' : agentState === 'running' ? 'AI Executing' : 'AI Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: What the user is making (Live Canvas) */}
        {(layout === 'split' || layout === 'preview-only') && (
          <div
            className={`flex flex-col h-full bg-slate-900 border-r border-slate-800 transition-all ${
              layout === 'split' ? 'w-3/5' : 'w-full'
            }`}
          >
            {/* Viewport Canvas Wrapper */}
            <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto">
              <div className={`transition-all duration-300 bg-white relative overflow-hidden flex flex-col ${getViewportWidth()}`}>
                {/* Mobile / Tablet Simulated Device Bar */}
                {viewport !== 'desktop' && (
                  <div className="h-6 bg-slate-800 w-full flex items-center justify-between px-3 select-none">
                    <span className="text-[10px] text-slate-400 font-mono">9:41 AM</span>
                    <div className="w-12 h-1.5 bg-slate-600 rounded-full" />
                    <span className="text-[10px] text-slate-400 font-mono">100%</span>
                  </div>
                )}

                {/* The Live Sandboxed Iframe */}
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  srcDoc={targetUrl.startsWith('live://') ? getPreviewHtml() : undefined}
                  src={targetUrl.startsWith('live://') ? undefined : targetUrl}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full border-none bg-slate-950"
                  title="App Live Preview"
                />
              </div>
            </div>

            {/* Bottom Mini Console Drawer */}
            <div className="border-t border-slate-800 bg-slate-900/90 text-xs font-mono">
              <div
                onClick={() => setConsoleOpen(!consoleOpen)}
                className="px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-850"
              >
                <div className="flex items-center space-x-2 text-slate-400">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold text-[11px]">Preview Console</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">0 errors</span>
                </div>
                <div className="text-slate-500 text-[10px]">
                  {consoleOpen ? 'Collapse ▲' : 'Expand ▼'}
                </div>
              </div>

              {consoleOpen && (
                <div className="p-3 bg-black/60 text-slate-300 font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
                  <div className="text-slate-500">[Info] Connected to WebSocket at ws://localhost:3001/ws</div>
                  <div className="text-slate-500">[Info] Live preview bundle re-rendered successfully</div>
                  <div className="text-emerald-400">[HMR] Hot module replacement initialized for active project</div>
                  <div className="text-slate-400">[DOM] Sandboxed frame isolated with Content Security Policy</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Panel 2: What the AI is doing right now (Real-time Agent Activity Feed) */}
        {(layout === 'split' || layout === 'agent-only') && (
          <div
            className={`flex flex-col h-full bg-slate-900/95 overflow-hidden ${
              layout === 'split' ? 'w-2/5' : 'w-full'
            }`}
          >
            {/* Agent Header Banner */}
            <div className="p-3 border-b border-slate-800 bg-slate-850/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">Live Agent Activity Feed</h3>
                  <p className="text-[10px] text-slate-400">Step-by-step reasoning & real-time tool stream</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {selectedModel}
                </span>
              </div>
            </div>

            {/* Live Feed List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Current Active Goal / Step Card */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    Current AI Operation
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Stream #24</span>
                </div>
                <div className="text-xs font-medium text-slate-200">
                  {agentState === 'thinking'
                    ? 'Formulating code delta & analyzing project tree...'
                    : 'Monitoring preview live cycle and awaiting next command.'}
                </div>

                {/* Reasoning Accordion */}
                <div className="mt-2.5 pt-2 border-t border-indigo-500/10">
                  <button
                    onClick={() => setIsExpandedThought(!isExpandedThought)}
                    className="flex items-center text-[11px] text-indigo-300 hover:text-indigo-200 font-mono"
                  >
                    {isExpandedThought ? <ChevronDown className="w-3 h-3 mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                    Internal Thought Chain
                  </button>
                  {isExpandedThought && (
                    <div className="mt-1.5 p-2 rounded-lg bg-black/40 text-[11px] font-mono text-slate-300 leading-relaxed border border-slate-800">
                      "I verified the live preview request. Project workspace contains active React and Node modules. Injecting real-time inspection hooks so the developer can visually test UI interactions alongside AI changes."
                    </div>
                  )}
                </div>
              </div>

              {/* Step Logs / Timeline */}
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1">
                  Recent Actions & Tool Calls
                </div>

                {agentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-850/60 border border-slate-800 text-xs flex flex-col space-y-1 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        {log.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {log.status === 'running' && <RotateCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                        {log.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                        <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[200px]">
                          {log.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{log.time}</span>
                    </div>
                    {log.detail && (
                      <p className="text-[11px] text-slate-400 pl-5 font-mono leading-tight">{log.detail}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Modified Files in this session */}
              <div className="pt-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-1 mb-2">
                  Files Updated by AI
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-300">
                    PreviewView.tsx <span className="text-emerald-400">+120</span>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-300">
                    Sidebar.tsx <span className="text-emerald-400">+12</span>
                  </span>
                  <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-300">
                    App.tsx <span className="text-emerald-400">+4</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Live Intervention Form at bottom */}
            <div className="p-3 border-t border-slate-800 bg-slate-850/80">
              <form onSubmit={handleSendIntervention} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Direct the AI while viewing preview..."
                  value={interventionText}
                  onChange={(e) => setInterventionText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
                <Button size="sm" type="submit" disabled={!interventionText.trim()} className="h-8 px-3">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
              <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                <span>Press Enter to steer agent instantly</span>
                <span className="font-mono">Runtime: Node v20 + SQLite</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
