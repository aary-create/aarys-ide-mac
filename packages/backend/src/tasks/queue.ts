// ============================================================
// Aary's IDE — Task Queue & Background Runner
// ============================================================

import type { Task } from '@aarys-ide/shared';
import { updateTaskStatus } from '../agent/orchestrator.js';

interface QueuedTask {
  task: Task;
  execute: () => Promise<void>;
}

class TaskQueue {
  private queue: QueuedTask[] = [];
  private isProcessing = false;

  enqueue(task: Task, execute: () => Promise<void>) {
    this.queue.push({ task, execute });
    this.processNext();
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const current = this.queue.shift();
    if (current) {
      updateTaskStatus(current.task.id, 'started');
      try {
        await current.execute();
        updateTaskStatus(current.task.id, 'completed', 100);
      } catch (err: any) {
        updateTaskStatus(current.task.id, 'failed');
      }
    }

    this.isProcessing = false;
    this.processNext();
  }
}

export const globalTaskQueue = new TaskQueue();
