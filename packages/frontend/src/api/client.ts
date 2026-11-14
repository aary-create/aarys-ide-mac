// ============================================================
// Aary's IDE — Frontend API Client
// ============================================================

const BASE_URL = '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('aary_auth_token');
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error?.message || json.error || 'Request failed');
  }
  return json.data ?? json;
}

export const api = {
  // Agent
  createSession: (deviceId?: string, workspaceId?: string) =>
    apiRequest('/agent/session', { method: 'POST', body: JSON.stringify({ deviceId, workspaceId }) }),
  getSessions: () => apiRequest('/agent/sessions'),
  getSession: (id: string) => apiRequest(`/agent/session/${id}`),
  sendMessage: (sessionId: string, message: string) =>
    apiRequest('/agent/chat', { method: 'POST', body: JSON.stringify({ sessionId, message }) }),
  approveAction: (id: string) => apiRequest(`/agent/approve/${id}`, { method: 'POST' }),
  rejectAction: (id: string) => apiRequest(`/agent/reject/${id}`, { method: 'POST' }),

  // AI Providers
  getProviders: () => apiRequest('/ai/providers'),
  addProvider: (data: any) => apiRequest('/ai/providers', { method: 'POST', body: JSON.stringify(data) }),
  testProvider: (id: string) => apiRequest(`/ai/providers/${id}/test`, { method: 'POST' }),
  deleteProvider: (id: string) => apiRequest(`/ai/providers/${id}`, { method: 'DELETE' }),

  // Projects & Files
  getProjects: () => apiRequest('/projects'),
  createProject: (name: string, path: string) =>
    apiRequest('/projects', { method: 'POST', body: JSON.stringify({ name, path }) }),
  getFiles: (projectId: string) => apiRequest(`/projects/${projectId}/files`),
  fileOp: (projectId: string, op: any) =>
    apiRequest(`/projects/${projectId}/file`, { method: 'POST', body: JSON.stringify(op) }),

  // Tasks
  getTasks: () => apiRequest('/tasks'),
  pauseTask: (id: string) => apiRequest(`/tasks/${id}/pause`, { method: 'POST' }),
  resumeTask: (id: string) => apiRequest(`/tasks/${id}/resume`, { method: 'POST' }),
  cancelTask: (id: string) => apiRequest(`/tasks/${id}/cancel`, { method: 'POST' }),

  // Memory
  searchMemory: (query = '', category?: string) =>
    apiRequest(`/memory?q=${encodeURIComponent(query)}${category ? `&category=${category}` : ''}`),
  addMemory: (data: any) => apiRequest('/memory', { method: 'POST', body: JSON.stringify(data) }),
  deleteMemory: (id: string) => apiRequest(`/memory/${id}`, { method: 'DELETE' }),

  // Tools & MCP
  getTools: () => apiRequest('/tools'),
  executeTool: (data: any) => apiRequest('/tools/execute', { method: 'POST', body: JSON.stringify(data) }),
  getMCPServers: () => apiRequest('/tools/mcp'),
  connectMCP: (data: any) => apiRequest('/tools/mcp/connect', { method: 'POST', body: JSON.stringify(data) }),

  // Connections
  getConnections: () => apiRequest('/connections'),
  disconnect: (type: string) => apiRequest(`/connections/${type}/disconnect`, { method: 'POST' }),

  // Devices
  getDevices: () => apiRequest('/devices'),
  registerDevice: (device: any) => apiRequest('/devices/register', { method: 'POST', body: JSON.stringify(device) }),

  // WhatsApp
  getWhatsAppStatus: () => apiRequest('/whatsapp/status'),
};
