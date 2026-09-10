import { pool } from '../../src/config/config/db';

export interface SeededTaxonomy {
  universityId: string;
}

let cached: SeededTaxonomy | null = null;

/**
 * Registration now requires a real university (field of study is a fixed
 * enum, no DB seed needed for it). Every integration test that registers
 * a user needs one of these, seeded via migration 009 (slug
 * 'universiti-teknologi-mara'). Returns null if the test database hasn't
 * been migrated, so callers can skip gracefully instead of failing with
 * a confusing downstream error.
 */
export async function seededTaxonomy(): Promise<SeededTaxonomy | null> {
  if (cached) return cached;

  const { rows: universities } = await pool.query<{ id: string }>(
    `SELECT id FROM universities WHERE slug = 'universiti-teknologi-mara'`,
  );
  if (!universities[0]) return null;

  cached = { universityId: universities[0].id };
  return cached;
}

export function baseRegisterPayload(taxonomy: SeededTaxonomy, overrides: Record<string, unknown> = {}) {
  return {
    password: 'Correcthorsebattery1!',
    displayName: 'Test User',
    academicRole: 'STUDENT',
    universityId: taxonomy.universityId,
    fieldOfStudy: 'Computing',
    currentYear: 2,
    currentSemester: 1,
    termsAccepted: true,
    ...overrides,
  };
}
