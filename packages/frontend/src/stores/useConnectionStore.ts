// ============================================================
// Aary's IDE — Connections Store
// ============================================================

import { create } from 'zustand';
import type { AIProviderConfig, Connection } from '@aarys-ide/shared';
import { api } from '../api/client.js';

interface ConnectionState {
  providers: AIProviderConfig[];
  connections: Connection[];
  loading: boolean;
  loadAll: () => Promise<void>;
  addAIProvider: (provider: any) => Promise<void>;
  testAIProvider: (id: string) => Promise<any>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  providers: [],
  connections: [],
  loading: false,

  loadAll: async () => {
    set({ loading: true });
    try {
      const [providers, connections] = await Promise.all([
        api.getProviders().catch(() => []),
        api.getConnections().catch(() => []),
      ]);
      set({ providers, connections, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addAIProvider: async (data: any) => {
    await api.addProvider(data);
    await get().loadAll();
  },

  testAIProvider: async (id: string) => {
    const res = await api.testProvider(id);
    await get().loadAll();
    return res;
  },
}));
