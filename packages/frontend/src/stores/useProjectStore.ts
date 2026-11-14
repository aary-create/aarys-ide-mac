// ============================================================
// Aary's IDE — Projects Store
// ============================================================

import { create } from 'zustand';
import type { Workspace, WorkspaceFile } from '@aarys-ide/shared';
import { api } from '../api/client.js';

interface ProjectState {
  projects: Workspace[];
  activeProject: Workspace | null;
  files: WorkspaceFile[];
  activeFile: string | null;
  fileContent: string;
  loading: boolean;
  loadProjects: () => Promise<void>;
  selectProject: (proj: Workspace) => Promise<void>;
  loadFile: (filePath: string) => Promise<void>;
  saveActiveFile: (content: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  files: [],
  activeFile: null,
  fileContent: '',
  loading: false,

  loadProjects: async () => {
    set({ loading: true });
    try {
      const projects = await api.getProjects();
      set({ projects, loading: false });
      if (projects.length > 0 && !get().activeProject) {
        get().selectProject(projects[0]);
      }
    } catch {
      set({ loading: false });
    }
  },

  selectProject: async (project: Workspace) => {
    set({ activeProject: project, loading: true });
    try {
      const files = await api.getFiles(project.id);
      set({ files, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  loadFile: async (filePath: string) => {
    const { activeProject } = get();
    if (!activeProject) return;
    try {
      const res = await api.fileOp(activeProject.id, { type: 'read', path: filePath });
      set({ activeFile: filePath, fileContent: typeof res === 'string' ? res : '' });
    } catch (err) {
      console.error(err);
    }
  },

  saveActiveFile: async (content: string) => {
    const { activeProject, activeFile } = get();
    if (!activeProject || !activeFile) return;
    try {
      await api.fileOp(activeProject.id, { type: 'update', path: activeFile, content });
      set({ fileContent: content });
    } catch (err) {
      console.error(err);
    }
  },
}));
