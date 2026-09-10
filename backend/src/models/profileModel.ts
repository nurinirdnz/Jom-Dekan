import { pool } from '../config/config/db';

export interface ProfileRow {
  user_id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  email_verified_at: Date | null;
  terms_accepted_at: Date | null;
  display_name: string;
  photo_path: string | null;
  academic_role: 'STUDENT' | 'TUTOR';
  university_id: string | null;
  university_name: string | null;
  field_of_study: string | null;
  study_level: string | null;
  current_year: number | null;
  current_semester: number | null;
  created_at: Date;
}

export interface ProfileStats {
  resource_count: number;
  forum_post_count: number;
  forum_comment_count: number;
}

const PROFILE_SELECT = `
  SELECT
    u.id AS user_id, u.email, u.role, u.email_verified_at, u.terms_accepted_at,
    p.display_name, p.photo_path, p.academic_role,
    p.university_id, uni.name AS university_name,
    p.field_of_study, p.study_level, p.current_year, p.current_semester, u.created_at
  FROM users u
  JOIN user_profiles p ON p.user_id = u.id
  LEFT JOIN universities uni ON uni.id = p.university_id
  WHERE u.id = $1 AND u.deleted_at IS NULL
`;

/**
 * Parameterized SQL only, no Express req/res — same rule as userModel.
 * Profile-facing reads/writes live here rather than on userModel, which
 * stays scoped to the auth flow (register/login/session concerns).
 */
export const profileModel = {
  async findByUserId(userId: string): Promise<ProfileRow | null> {
    const result = await pool.query<ProfileRow>(PROFILE_SELECT, [userId]);
    return result.rows[0] ?? null;
  },

  async update(
    userId: string,
    fields: Partial<{
      displayName: string;
      academicRole: 'STUDENT' | 'TUTOR';
      universityId: string;
      fieldOfStudy: string;
      currentYear: number;
      currentSemester: number;
    }>,
  ): Promise<ProfileRow | null> {
    const columns: Record<string, string> = {
      displayName: 'display_name',
      academicRole: 'academic_role',
      universityId: 'university_id',
      fieldOfStudy: 'field_of_study',
      currentYear: 'current_year',
      currentSemester: 'current_semester',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [userId];

    for (const [key, column] of Object.entries(columns)) {
      const value = fields[key as keyof typeof fields];
      if (value !== undefined) {
        values.push(value);
        setClauses.push(`${column} = $${values.length}`);
      }
    }

    if (setClauses.length === 0) {
      return this.findByUserId(userId);
    }

    await pool.query(`UPDATE user_profiles SET ${setClauses.join(', ')} WHERE user_id = $1`, values);
    return this.findByUserId(userId);
  },

  async getStats(userId: string): Promise<ProfileStats> {
    const result = await pool.query<ProfileStats>(
      `SELECT
         (SELECT COUNT(*) FROM resources WHERE owner_id = $1)::int AS resource_count,
         (SELECT COUNT(*) FROM forum_posts WHERE author_id = $1 AND deleted_at IS NULL)::int AS forum_post_count,
         (SELECT COUNT(*) FROM forum_comments WHERE author_id = $1 AND deleted_at IS NULL)::int AS forum_comment_count`,
      [userId],
    );
    return result.rows[0];
  },
};

export function toApiProfile(row: ProfileRow) {
  return {
    id: row.user_id,
    email: row.email,
    role: row.role,
    emailVerified: row.email_verified_at !== null,
    termsAcceptedAt: row.terms_accepted_at,
    displayName: row.display_name,
    photoPath: row.photo_path,
    academicRole: row.academic_role,
    university: row.university_id ? { id: row.university_id, name: row.university_name } : null,
    fieldOfStudy: row.field_of_study,
    studyLevel: row.study_level,
    currentYear: row.current_year,
    currentSemester: row.current_semester,
    createdAt: row.created_at,
  };
}

export function toApiStats(stats: ProfileStats) {
  return {
    resourceCount: stats.resource_count,
    forumPostCount: stats.forum_post_count,
    forumCommentCount: stats.forum_comment_count,
  };
}
