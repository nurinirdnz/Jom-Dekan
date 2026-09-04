import { pool } from '../config/config/db';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED' | 'DEACTIVATED';
  auth_provider: 'PASSWORD' | 'GOOGLE';
  email_verified_at: Date | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Parameterized SQL only. This module must never depend on Express
 * req/res — it is a pure data-access layer callable from services and
 * from scripts (e.g. createAdmin.ts) alike.
 */
export const userModel = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email.trim().toLowerCase()],
    );
    return result.rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async create(params: { email: string; passwordHash: string; displayName: string }): Promise<UserRow> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<UserRow>(
        `INSERT INTO users (email, password_hash)
         VALUES ($1, $2)
         RETURNING *`,
        [params.email.trim().toLowerCase(), params.passwordHash],
      );
      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO user_profiles (user_id, display_name)
         VALUES ($1, $2)`,
        [user.id, params.displayName],
      );

      await client.query('COMMIT');
      return user;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async setRole(id: string, role: 'USER' | 'ADMIN'): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `UPDATE users SET role = $2 WHERE id = $1 RETURNING *`,
      [id, role],
    );
    return result.rows[0] ?? null;
  },
};

export function toSafeUser(row: UserRow): { id: string; email: string; role: string; createdAt: Date } {
  return { id: row.id, email: row.email, role: row.role, createdAt: row.created_at };
}
