import { pool } from "../config/config/db";

export interface UniversityRow {
  id: string;
  name: string;
  slug: string;
  country: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface FacultyRow {
  id: string;
  university_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface ProgrammeRow {
  id: string;
  faculty_id: string;
  name: string;
  slug: string;
  study_level: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
export interface SubjectRow {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Parameterized SQL only, no Express req/res — same rule as userModel.
 * "Archive" (setActive false) is used instead of DELETE everywhere here
 * because resources/profiles may reference these rows by id; removing
 * the row outright would either fail the foreign key or silently orphan
 * data. Nothing in this module ever runs a hard DELETE.
 */
export const taxonomyModel = {
  universities: {
    async list(): Promise<UniversityRow[]> {
      const result = await pool.query<UniversityRow>(
        `SELECT * FROM universities ORDER BY is_active DESC, name ASC`,
      );
      return result.rows;
    },
    async findById(id: string): Promise<UniversityRow | null> {
      const result = await pool.query<UniversityRow>(
        `SELECT * FROM universities WHERE id = $1`,
        [id],
      );
      return result.rows[0] ?? null;
    },
    async create(params: {
      name: string;
      slug: string;
      country: string;
    }): Promise<UniversityRow> {
      const result = await pool.query<UniversityRow>(
        `INSERT INTO universities (name, slug, country) VALUES ($1, $2, $3) RETURNING *`,
        [params.name, params.slug, params.country],
      );
      return result.rows[0];
    },
    async update(
      id: string,
      params: { name: string; slug: string; country: string },
    ): Promise<UniversityRow | null> {
      const result = await pool.query<UniversityRow>(
        `UPDATE universities SET name = $2, slug = $3, country = $4 WHERE id = $1 RETURNING *`,
        [id, params.name, params.slug, params.country],
      );
      return result.rows[0] ?? null;
    },
    async setActive(
      id: string,
      isActive: boolean,
    ): Promise<UniversityRow | null> {
      const result = await pool.query<UniversityRow>(
        `UPDATE universities SET is_active = $2 WHERE id = $1 RETURNING *`,
        [id, isActive],
      );
      return result.rows[0] ?? null;
    },
  },

  faculties: {
    async listByUniversity(universityId: string): Promise<FacultyRow[]> {
      const result = await pool.query<FacultyRow>(
        `SELECT * FROM faculties WHERE university_id = $1 ORDER BY is_active DESC, name ASC`,
        [universityId],
      );
      return result.rows;
    },
    async create(params: {
      universityId: string;
      name: string;
      slug: string;
    }): Promise<FacultyRow> {
      const result = await pool.query<FacultyRow>(
        `INSERT INTO faculties (university_id, name, slug) VALUES ($1, $2, $3) RETURNING *`,
        [params.universityId, params.name, params.slug],
      );
      return result.rows[0];
    },
    async update(
      id: string,
      params: { name: string; slug: string },
    ): Promise<FacultyRow | null> {
      const result = await pool.query<FacultyRow>(
        `UPDATE faculties SET name = $2, slug = $3 WHERE id = $1 RETURNING *`,
        [id, params.name, params.slug],
      );
      return result.rows[0] ?? null;
    },
    async setActive(id: string, isActive: boolean): Promise<FacultyRow | null> {
      const result = await pool.query<FacultyRow>(
        `UPDATE faculties SET is_active = $2 WHERE id = $1 RETURNING *`,
        [id, isActive],
      );
      return result.rows[0] ?? null;
    },
  },

  programmes: {
    async listByFaculty(facultyId: string): Promise<ProgrammeRow[]> {
      const result = await pool.query<ProgrammeRow>(
        `SELECT * FROM programmes WHERE faculty_id = $1 ORDER BY is_active DESC, name ASC`,
        [facultyId],
      );
      return result.rows;
    },
    async create(params: {
      facultyId: string;
      name: string;
      slug: string;
      studyLevel: string | null;
    }): Promise<ProgrammeRow> {
      const result = await pool.query<ProgrammeRow>(
        `INSERT INTO programmes (faculty_id, name, slug, study_level) VALUES ($1, $2, $3, $4) RETURNING *`,
        [params.facultyId, params.name, params.slug, params.studyLevel],
      );
      return result.rows[0];
    },
    async update(
      id: string,
      params: { name: string; slug: string; studyLevel: string | null },
    ): Promise<ProgrammeRow | null> {
      const result = await pool.query<ProgrammeRow>(
        `UPDATE programmes SET name = $2, slug = $3, study_level = $4 WHERE id = $1 RETURNING *`,
        [id, params.name, params.slug, params.studyLevel],
      );
      return result.rows[0] ?? null;
    },
    async setActive(
      id: string,
      isActive: boolean,
    ): Promise<ProgrammeRow | null> {
      const result = await pool.query<ProgrammeRow>(
        `UPDATE programmes SET is_active = $2 WHERE id = $1 RETURNING *`,
        [id, isActive],
      );
      return result.rows[0] ?? null;
    },
  },

  subjects: {
    async list(): Promise<SubjectRow[]> {
      const result = await pool.query<SubjectRow>(
        `SELECT * FROM subjects ORDER BY is_active DESC, name ASC`,
      );
      return result.rows;
    },
    async create(params: { code: string; name: string }): Promise<SubjectRow> {
      const result = await pool.query<SubjectRow>(
        `INSERT INTO subjects (code, name) VALUES ($1, $2) RETURNING *`,
        [params.code, params.name],
      );
      return result.rows[0];
    },
    async update(
      id: string,
      params: { name: string },
    ): Promise<SubjectRow | null> {
      const result = await pool.query<SubjectRow>(
        `UPDATE subjects SET name = $2 WHERE id = $1 RETURNING *`,
        [id, params.name],
      );
      return result.rows[0] ?? null;
    },
    async setActive(id: string, isActive: boolean): Promise<SubjectRow | null> {
      const result = await pool.query<SubjectRow>(
        `UPDATE subjects SET is_active = $2 WHERE id = $1 RETURNING *`,
        [id, isActive],
      );
      return result.rows[0] ?? null;
    },
  },
};

// Row -> API shape mapping, same purpose as toSafeUser in userModel.ts.
export function toApiUniversity(row: UniversityRow) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export function toApiFaculty(row: FacultyRow) {
  return {
    id: row.id,
    universityId: row.university_id,
    name: row.name,
    slug: row.slug,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export function toApiProgramme(row: ProgrammeRow) {
  return {
    id: row.id,
    facultyId: row.faculty_id,
    name: row.name,
    slug: row.slug,
    studyLevel: row.study_level,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export function toApiSubject(row: SubjectRow) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
