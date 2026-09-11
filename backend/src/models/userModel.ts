import { pool } from '../config/config/db';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED' | 'DEACTIVATED';
  auth_provider: 'PASSWORD' | 'GOOGLE';
  email_verified_at: Date | null;
  terms_accepted_at: Date | null;
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

  async create(params: {
    email: string;
    passwordHash: string;
    displayName: string;
    academicRole: 'STUDENT' | 'TUTOR';
    universityId: string;
    fieldOfStudy: string;
    currentYear: number;
    currentSemester: number;
  }): Promise<UserRow> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userResult = await client.query<UserRow>(
        `INSERT INTO users (email, password_hash, terms_accepted_at)
         VALUES ($1, $2, now())
         RETURNING *`,
        [params.email.trim().toLowerCase(), params.passwordHash],
      );
      const user = userResult.rows[0];

      await client.query(
        `INSERT INTO user_profiles (user_id, display_name, academic_role, university_id, field_of_study, current_year, current_semester)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          user.id,
          params.displayName,
          params.academicRole,
          params.universityId,
          params.fieldOfStudy,
          params.currentYear,
          params.currentSemester,
        ],
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

  async markEmailVerified(id: string): Promise<void> {
    await pool.query(`UPDATE users SET email_verified_at = now() WHERE id = $1`, [id]);
  },

  /**
   * Resets email_verified_at to NULL — the new address hasn't been
   * confirmed yet. The caller (profileService) is responsible for
   * sending a fresh verification email via authService.sendVerificationEmail,
   * reusing the exact same token/email flow issued at registration.
   */
  async updateEmail(id: string, email: string): Promise<UserRow> {
    const result = await pool.query<UserRow>(
      `UPDATE users SET email = $2, email_verified_at = NULL WHERE id = $1 RETURNING *`,
      [id, email.trim().toLowerCase()],
    );
    return result.rows[0];
  },

  async setRole(id: string, role: 'USER' | 'ADMIN'): Promise<UserRow | null> {
    const result = await pool.query<UserRow>(
      `UPDATE users SET role = $2 WHERE id = $1 RETURNING *`,
      [id, role],
    );
    return result.rows[0] ?? null;
  },

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await pool.query(`UPDATE users SET password_hash = $2 WHERE id = $1`, [id, passwordHash]);
  },
};

export function toSafeUser(row: UserRow): {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
} {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    emailVerified: row.email_verified_at !== null,
    createdAt: row.created_at,
  };
}
