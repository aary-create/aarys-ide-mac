// ============================================================
// Aary's IDE — App Store
// ============================================================

import { create } from 'zustand';

export type NavigationSection =
  | 'chat'
  | 'agent'
  | 'preview'
  | 'computer'
  | 'projects'
  | 'browser'
  | 'run'
  | 'tools'
  | 'connections'
  | 'memory'
  | 'tasks'
  | 'settings';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  activeSection: NavigationSection;
  setActiveSection: (sec: NavigationSection) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: (localStorage.getItem('aary_theme') as 'light' | 'dark') || 'dark',
  setTheme: (theme) => {
    localStorage.setItem('aary_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aary_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return { theme: next };
    }),
  activeSection: 'chat',
  setActiveSection: (activeSection) => set({ activeSection }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
}));
