// ============================================================
// Aary's IDE — App Layout
// Universal Responsive Shell
// ============================================================

import React from 'react';
import { Sidebar } from './Sidebar.js';
import { TopBar } from './TopBar.js';
import { StatusBar } from './StatusBar.js';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full min-w-0">
        <TopBar />
        <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50">
          {children}
        </main>
        <StatusBar />
      </div>
    </div>
  );
};
