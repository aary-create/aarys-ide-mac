// ============================================================
// Aary's IDE — Tasks Store
// ============================================================

import { create } from 'zustand';
import type { Task } from '@aarys-ide/shared';
import { api } from '../api/client.js';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  pauseTask: (id: string) => Promise<void>;
  resumeTask: (id: string) => Promise<void>;
  cancelTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,

  loadTasks: async () => {
    set({ loading: true });
    try {
      const tasks = await api.getTasks();
      set({ tasks, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  pauseTask: async (id: string) => {
    await api.pauseTask(id);
    await get().loadTasks();
  },

  resumeTask: async (id: string) => {
    await api.resumeTask(id);
    await get().loadTasks();
  },

  cancelTask: async (id: string) => {
    await api.cancelTask(id);
    await get().loadTasks();
  },
}));
