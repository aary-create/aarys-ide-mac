// ============================================================
// Aary's IDE — Agent Store
// ============================================================

import { create } from 'zustand';
import type { AgentMessage, AgentState, AgentSession } from '@aarys-ide/shared';
import { api } from '../api/client.js';

interface AgentStoreState {
  currentSession: AgentSession | null;
  messages: AgentMessage[];
  state: AgentState;
  sessions: Array<{ id: string; title: string; updatedAt: string }>;
  loading: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  initSession: () => Promise<void>;
  switchSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  setState: (state: AgentState) => void;
  appendStreamChunk: (chunk: string) => void;
}

export const useAgentStore = create<AgentStoreState>((set, get) => ({
  currentSession: null,
  messages: [],
  state: 'idle',
  sessions: [],
  loading: false,
  selectedModel: 'Auto Route',
  setSelectedModel: (selectedModel) => set({ selectedModel }),

  initSession: async () => {
    try {
      const list = await api.getSessions();
      set({ sessions: list });

      if (list.length > 0) {
        await get().switchSession(list[0].id);
      } else {
        const session = await api.createSession();
        set({ currentSession: session, messages: session.messages || [] });
      }
    } catch {
      // Fallback offline session
      set({
        currentSession: {
          id: 'local_default',
          userId: 'user',
          state: 'idle',
          messages: [],
          capabilities: {
            coding: true, browser: true, computerUse: true,
            fileGeneration: true, terminal: true, git: true, speech: true, vision: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
  },

  switchSession: async (sessionId: string) => {
    try {
      const session = await api.getSession(sessionId);
      set({ currentSession: session, messages: session.messages || [] });
    } catch (err) {
      console.error(err);
    }
  },

  sendMessage: async (content: string) => {
    const { currentSession, messages } = get();
    if (!currentSession) return;

    const userMsg: AgentMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    set({ messages: [...messages, userMsg], state: 'thinking', loading: true });

    try {
      const reply = await api.sendMessage(currentSession.id, content);
      set((s) => ({
        messages: [...s.messages, reply],
        state: 'idle',
        loading: false,
      }));
    } catch (err: any) {
      const errorMsg: AgentMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Agent encountered an error: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        state: 'error',
        loading: false,
      }));
    }
  },

  setState: (state) => set({ state }),

  appendStreamChunk: (chunk: string) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'assistant') {
        last.content += chunk;
      } else {
        msgs.push({
          id: `stream_${Date.now()}`,
          role: 'assistant',
          content: chunk,
          timestamp: new Date().toISOString(),
        });
      }
      return { messages: msgs };
    });
  },
}));
