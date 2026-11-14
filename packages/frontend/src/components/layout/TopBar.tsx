// ============================================================
// Aary's IDE — Top Bar
// Search, Universal Quick Run, AI Provider status, Theme toggle
// ============================================================

import React from 'react';
import { Search, Sun, Moon, Play, PanelLeft, Cpu } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore.js';
import { useAgentStore } from '../../stores/useAgentStore.js';
import { Button } from '../ui/index.js';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme, toggleSidebar, setActiveSection } = useAppStore();
  const { state, selectedModel } = useAgentStore();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-850 px-4 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
      {/* Left controls */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle Sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Global Search / Command Bar */}
        <div className="relative w-64 md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search or ask anything... (Cmd+K)"
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2.5">
        {/* Model info pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[11px] font-mono text-slate-600 dark:text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
          <span>{selectedModel}</span>
        </div>

        {/* Prominent Quick Run Button */}
        <Button
          size="sm"
          variant="primary"
          onClick={() => setActiveSection('run')}
          className="font-mono text-xs px-3"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
          Run
        </Button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
