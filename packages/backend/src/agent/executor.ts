// ============================================================
// Aary's IDE — Agent Executor
// Tool execution engine with timeout and error tracking
// ============================================================

import type { ToolExecutionRequest, ToolExecutionResult } from '@aarys-ide/shared';
import { executeTool } from '../tools/registry.js';

export class AgentExecutor {
  async runTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    try {
      const result = await executeTool(request);
      return result;
    } catch (err: any) {
      return {
        toolName: request.toolName,
        success: false,
        error: err.message || 'Execution failed',
        duration: 0,
      };
    }
  }

  async runBatch(requests: ToolExecutionRequest[]): Promise<ToolExecutionResult[]> {
    const results: ToolExecutionResult[] = [];
    for (const req of requests) {
      results.push(await this.runTool(req));
    }
    return results;
  }
}

export const defaultExecutor = new AgentExecutor();
