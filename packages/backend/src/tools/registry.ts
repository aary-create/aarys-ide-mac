// ============================================================
// Aary's IDE — Tool Registry
// Manages all available agent tools
// ============================================================

import type { ToolDefinition, ToolExecutionRequest, ToolExecutionResult } from '@aarys-ide/shared';

type ToolHandler = (args: Record<string, unknown>, context: { sessionId: string; workspacePath?: string }) => Promise<unknown>;

const tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>();

export function registerTool(definition: ToolDefinition, handler: ToolHandler): void {
  tools.set(definition.name, { definition, handler });
}

export function getTool(name: string) {
  return tools.get(name);
}

export function listTools(): ToolDefinition[] {
  return Array.from(tools.values()).map(t => t.definition);
}

export function getToolsForAI() {
  return listTools().map(t => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: 'object',
        properties: t.parameters,
        required: Object.entries(t.parameters).filter(([_, p]) => p.required).map(([k]) => k),
      },
    },
  }));
}

export async function executeTool(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
  const tool = tools.get(request.toolName);
  if (!tool) {
    return { toolName: request.toolName, success: false, error: `Unknown tool: ${request.toolName}`, duration: 0 };
  }

  const start = Date.now();
  try {
    const result = await tool.handler(request.args, { sessionId: request.sessionId, workspacePath: undefined });
    return { toolName: request.toolName, success: true, result, duration: Date.now() - start };
  } catch (e: any) {
    return { toolName: request.toolName, success: false, error: e.message, duration: Date.now() - start };
  }
}
