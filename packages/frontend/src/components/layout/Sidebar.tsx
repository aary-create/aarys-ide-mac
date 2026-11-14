// ============================================================
// Aary's IDE — Sidebar Navigation
// Responsive, calm, minimal, agent-first
// ============================================================

import React from 'react';
import {
  MessageSquare,
  Bot,
  Monitor,
  FolderGit2,
  Compass,
  Play,
  Wrench,
  Link2,
  Brain,
  CheckSquare,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAppStore, type NavigationSection } from '../../stores/useAppStore.js';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'agent', label: 'Agent', icon: Bot },
  { id: 'computer', label: 'Computer', icon: Monitor },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'browser', label: 'Browser', icon: Compass },
  { id: 'run', label: 'Run', icon: Play },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeSection, setActiveSection, sidebarCollapsed } = useAppStore();

  return (
    <aside
      className={`h-screen bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 flex flex-col transition-all duration-200 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-850">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Aary's IDE</span>
              <span className="block text-[10px] text-slate-400 font-mono">v1.0 • Universal</span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="ml-3 truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status / Mode */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-850">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {!sidebarCollapsed && <span className="text-[11px] text-slate-500 font-mono">Runtime Active</span>}
        </div>
      </div>
    </aside>
  );
};
