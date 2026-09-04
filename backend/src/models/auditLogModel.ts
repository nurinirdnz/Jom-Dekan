import { pool } from '../config/config/db';

/**
 * Append-only. No update/delete function is exported on purpose —
 * audit history must never be silently rewritten.
 */
export const auditLogModel = {
  async record(params: {
    actorUserId?: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
    requestId?: string;
    ipAddress?: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO audit_logs (actor_user_id, action, target_type, target_id, reason, metadata, request_id, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.actorUserId ?? null,
        params.action,
        params.targetType ?? null,
        params.targetId ?? null,
        params.reason ?? null,
        JSON.stringify(params.metadata ?? {}),
        params.requestId ?? null,
        params.ipAddress ?? null,
      ],
    );
  },
};
