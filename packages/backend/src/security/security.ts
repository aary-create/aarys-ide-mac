// ============================================================
// Aary's IDE — Security, Permissions & Audit Logging
// ============================================================

import type { ApprovalRequest } from '@aarys-ide/shared';
import { generateId } from '@aarys-ide/shared';
import { db } from '../database.js';

const pendingApprovals = new Map<string, ApprovalRequest>();

export function createApprovalRequest(
  taskId: string,
  action: string,
  description: string,
  risk: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, unknown>
): ApprovalRequest {
  const req: ApprovalRequest = {
    id: generateId(),
    taskId,
    action,
    description,
    risk,
    details,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  pendingApprovals.set(req.id, req);
  return req;
}

export function resolveApproval(id: string, approved: boolean): boolean {
  const req = pendingApprovals.get(id);
  if (!req) return false;
  req.status = approved ? 'approved' : 'rejected';
  logAudit('system', approved ? 'approval_granted' : 'approval_rejected', req, req.risk);
  return true;
}

export function logAudit(
  userId: string,
  action: string,
  details: Record<string, unknown>,
  risk = 'low'
): void {
  const id = generateId();
  db.prepare(`
    INSERT INTO audit_log (id, user_id, action, details, risk, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, action, JSON.stringify(details), risk, new Date().toISOString());
}
