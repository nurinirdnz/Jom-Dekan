import { pool } from '../config/config/db';

export interface EmailVerificationTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
}

export const emailVerificationTokenModel = {
  async create(params: { userId: string; tokenHash: string; expiresAt: Date }): Promise<EmailVerificationTokenRow> {
    const result = await pool.query<EmailVerificationTokenRow>(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.userId, params.tokenHash, params.expiresAt],
    );
    return result.rows[0];
  },

  async findValidByTokenHash(tokenHash: string): Promise<EmailVerificationTokenRow | null> {
    const result = await pool.query<EmailVerificationTokenRow>(
      `SELECT * FROM email_verification_tokens
       WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()`,
      [tokenHash],
    );
    return result.rows[0] ?? null;
  },

  async markUsed(id: string): Promise<void> {
    await pool.query(`UPDATE email_verification_tokens SET used_at = now() WHERE id = $1`, [id]);
  },

  /** Called when a new link is (re)issued, so only the newest one is ever valid. */
  async invalidateAllForUser(userId: string): Promise<void> {
    await pool.query(
      `UPDATE email_verification_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );
  },
};
