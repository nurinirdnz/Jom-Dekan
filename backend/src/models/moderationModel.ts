import { pool } from "../config/config/db";

export class ModerationModel {
  static async getNotificationsForUser(userId: string) {
    const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async markNotificationRead(id: string, userId: string) {
    const query = `
            UPDATE notifications 
            SET read_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND user_id = $2 
            RETURNING *
        `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  static async getModerationQueue() {
    const query = `
            SELECT r.id, 'resource' as entity_type, r.id as entity_id, r.title as details, r.moderation_status, r.created_at
            FROM resources r
            WHERE r.moderation_status = 'pending_moderation'
            UNION ALL
            SELECT rep.id, 'report' as entity_type, rep.entity_id, rep.reason as details, rep.status as moderation_status, rep.created_at
            FROM reports rep
            WHERE rep.status = 'pending'
            ORDER BY created_at DESC
        `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateResourceModeration(
    resourceId: string,
    status: string,
    adminId: string,
    reason: string,
  ) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Update resource status
      const updateQuery = `
                UPDATE resources 
                SET moderation_status = $1 
                WHERE id = $2 
                RETURNING *
            `;
      const updated = await client.query(updateQuery, [status, resourceId]);

      // Mandatory immutable audit log entry
      const auditQuery = `
                INSERT INTO audit_logs (actor_id, action, target_type, target_id, reason, metadata)
                VALUES ($1, $2, 'resource', $3, $4, $5)
            `;
      await client.query(auditQuery, [
        adminId,
        `MODERATION_${status.toUpperCase()}`,
        resourceId,
        reason,
        JSON.stringify({ status }),
      ]);

      await client.query("COMMIT");
      return updated.rows[0];
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
}
