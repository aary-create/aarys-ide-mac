// Aary's IDE — Task Planner (simple for now, AI generates plans)
export function createPlan(request: string) {
  return { steps: [{ id: '1', description: request, status: 'pending' as const }] };
}
