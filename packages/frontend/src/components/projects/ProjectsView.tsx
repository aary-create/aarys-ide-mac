// ============================================================
// Aary's IDE — Projects & Workspace Explorer
// Monaco Code Editor + File Tree
// ============================================================

import React, { useEffect, useState } from 'react';
import { Folder, FileCode, Plus, Save, GitBranch } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '../../stores/useProjectStore.js';
import { useAppStore } from '../../stores/useAppStore.js';
import { Button } from '../ui/index.js';

export const ProjectsView: React.FC = () => {
  const { projects, activeProject, files, activeFile, fileContent, loadProjects, selectProject, loadFile, saveActiveFile } = useProjectStore();
  const { theme } = useAppStore();
  const [editorVal, setEditorVal] = useState(fileContent);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    setEditorVal(fileContent);
  }, [fileContent]);

  return (
    <div className="flex h-full w-full">
      {/* Sidebar: Projects and Files */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-850 flex flex-col bg-white dark:bg-slate-900">
        <div className="p-3 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Workspaces</span>
          <Button size="sm" variant="ghost" className="p-1 h-auto">
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProject(p)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-2 truncate ${
                activeProject?.id === p.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{p.name}</span>
            </button>
          ))}

          {activeProject && (
            <div className="pt-3">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5">
                Files
              </div>
              <div className="space-y-0.5">
                {files.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => f.type === 'file' && loadFile(f.path)}
                    className={`w-full text-left px-2.5 py-1 rounded-md text-xs font-mono flex items-center space-x-2 truncate ${
                      activeFile === f.path
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-medium'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    {f.type === 'directory' ? (
                      <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <FileCode className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor & Preview Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950">
        <div className="h-10 border-b border-slate-200 dark:border-slate-850 px-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
            {activeFile || 'No file selected'}
          </span>
          {activeFile && (
            <Button size="sm" onClick={() => saveActiveFile(editorVal || '')} className="h-7 text-xs">
              <Save className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={editorVal}
            onChange={(val) => setEditorVal(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>
    </div>
  );
};
