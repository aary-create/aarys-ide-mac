// ============================================================
// Aary's IDE — Tasks View
// Autonomous Background Task Manager
// ============================================================

import React, { useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Pause, Play, XCircle } from 'lucide-react';
import { Card, Button, Badge } from '../ui/index.js';
import { useTaskStore } from '../../stores/useTaskStore.js';

export const TasksView: React.FC = () => {
  const { tasks, loadTasks, pauseTask, resumeTask, cancelTask, loading } = useTaskStore();

  useEffect(() => {
    loadTasks();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'verified':
        return <Badge variant="success">{status.toUpperCase()}</Badge>;
      case 'executing':
      case 'started':
        return <Badge variant="info">{status.toUpperCase()}</Badge>;
      case 'failed':
        return <Badge variant="danger">{status.toUpperCase()}</Badge>;
      default:
        return <Badge variant="warning">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active, verified, paused, and autonomous background execution records.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={loadTasks} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No tasks recorded yet.</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between space-x-4"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2.5 mb-1.5">
                  {getStatusBadge(t.status)}
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono line-clamp-1">{t.originalRequest}</p>

                {/* Progress bar */}
                <div className="mt-3 w-48 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${t.progress || 0}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {t.status === 'executing' ? (
                  <Button size="sm" variant="secondary" onClick={() => pauseTask(t.id)}>
                    <Pause className="w-3.5 h-3.5 mr-1" />
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => resumeTask(t.id)}>
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Resume
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => cancelTask(t.id)} className="text-rose-500">
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
