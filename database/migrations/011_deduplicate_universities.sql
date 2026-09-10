-- =====================================================================
-- Migration 011: Deduplicate universities + prevent recurrence
-- JomDekan — the old dev seed.sql inserted 'Universiti Teknologi MARA' /
-- 'Universiti Malaya' / 'Universiti Kebangsaan Malaysia' under short,
-- hand-picked slugs ('uitm' / 'um' / 'ukm'). Migration 009 re-inserted
-- the same 3 institutions (among 77 others) using the standard
-- slugify(name) slug, which is different text — so the slug UNIQUE
-- constraint never caught the collision and both rows survived.
--
-- This migration merges each legacy short-slug row into its migration
-- 009 counterpart: every foreign key reference (user_profiles,
-- resources, faculties) is moved first, so no user/resource/faculty
-- data is lost, then the legacy row is deleted. A generic pass then
-- catches any other name collisions the same way (oldest row wins), and
-- finally a case-insensitive uniqueness guard on name is added so this
-- class of bug cannot recur, regardless of what slug a future insert
-- picks.
-- =====================================================================
-- Idempotent-safe: every step only acts on rows/index that still exist.

DO $$
DECLARE
  legacy RECORD;
  canonical_id UUID;
BEGIN
  FOR legacy IN
    SELECT id FROM universities WHERE slug IN ('uitm', 'um', 'ukm')
  LOOP
    SELECT id INTO canonical_id
    FROM universities
    WHERE id <> legacy.id
      AND lower(btrim(name)) = (SELECT lower(btrim(name)) FROM universities WHERE id = legacy.id)
    LIMIT 1;

    IF canonical_id IS NOT NULL THEN
      UPDATE user_profiles SET university_id = canonical_id WHERE university_id = legacy.id;
      UPDATE resources SET university_id = canonical_id WHERE university_id = legacy.id;
      UPDATE faculties SET university_id = canonical_id WHERE university_id = legacy.id;
      DELETE FROM universities WHERE id = legacy.id;
    END IF;
  END LOOP;
END $$;

-- Belt-and-braces: merge any other accidental name collisions, keeping
-- whichever row is oldest.
DO $$
DECLARE
  dup RECORD;
BEGIN
  FOR dup IN
    SELECT id, canonical_id FROM (
      SELECT id,
             first_value(id) OVER (PARTITION BY lower(btrim(name)) ORDER BY created_at, id) AS canonical_id
      FROM universities
    ) ranked
    WHERE id <> canonical_id
  LOOP
    UPDATE user_profiles SET university_id = dup.canonical_id WHERE university_id = dup.id;
    UPDATE resources SET university_id = dup.canonical_id WHERE university_id = dup.id;
    UPDATE faculties SET university_id = dup.canonical_id WHERE university_id = dup.id;
    DELETE FROM universities WHERE id = dup.id;
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_universities_name_unique_ci'
  ) THEN
    CREATE UNIQUE INDEX idx_universities_name_unique_ci ON universities (lower(btrim(name)));
  END IF;
END $$;
