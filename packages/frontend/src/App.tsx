// ============================================================
// Aary's IDE — Main App Component
// ============================================================

import React, { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout.js';
import { useAppStore } from './stores/useAppStore.js';
import { useAgentStore } from './stores/useAgentStore.js';
import { wsClient } from './api/websocket.js';

// Views
import { ChatView } from './components/chat/ChatView.js';
import { AgentView } from './components/agent/AgentView.js';
import { ComputerView } from './components/computer/ComputerView.js';
import { ProjectsView } from './components/projects/ProjectsView.js';
import { BrowserView } from './components/browser/BrowserView.js';
import { RunView } from './components/run/RunView.js';
import { ToolsView } from './components/tools/ToolsView.js';
import { ConnectionsView } from './components/connections/ConnectionsView.js';
import { MemoryView } from './components/memory/MemoryView.js';
import { TasksView } from './components/tasks/TasksView.js';
import { SettingsView } from './components/settings/SettingsView.js';

export const App: React.FC = () => {
  const { activeSection, theme } = useAppStore();
  const { initSession, setState, appendStreamChunk } = useAgentStore();

  useEffect(() => {
    // Apply theme
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Connect WebSocket
    wsClient.connect();

    wsClient.on('agent:state_change', (payload) => {
      if (payload.state) setState(payload.state);
    });

    wsClient.on('agent:stream_chunk', (payload) => {
      if (payload.content) appendStreamChunk(payload.content);
    });

    // Initialize agent session
    initSession();
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'chat':
        return <ChatView />;
      case 'agent':
        return <AgentView />;
      case 'computer':
        return <ComputerView />;
      case 'projects':
        return <ProjectsView />;
      case 'browser':
        return <BrowserView />;
      case 'run':
        return <RunView />;
      case 'tools':
        return <ToolsView />;
      case 'connections':
        return <ConnectionsView />;
      case 'memory':
        return <MemoryView />;
      case 'tasks':
        return <TasksView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <ChatView />;
    }
  };

  return <AppLayout>{renderSection()}</AppLayout>;
};
