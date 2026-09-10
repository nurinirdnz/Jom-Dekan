-- =====================================================================
-- Migration 008: Field of study + current semester on user_profiles
-- JomDekan — replaces the faculty/programme pick (which required a
-- specific university's internal structure to already be modelled) with
-- a fixed, general list of 27 fields of study that applies the same way
-- to every university. Also adds current_semester alongside the
-- existing current_year, since Malaysian academic years are commonly
-- split into semesters.
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS / DO blocks so it can be re-run
-- against a clean database. 001-007 are taken; this is 008.

-- Registration/profile no longer link to a specific programme row —
-- faculties/programmes stay in place for resource tagging (see
-- resources.faculty_id / resources.programme_id), but a user's own
-- academic profile now records a general field of study instead.
ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS fk_user_profiles_programme;

DROP INDEX IF EXISTS idx_user_profiles_programme;

ALTER TABLE user_profiles
    DROP COLUMN IF EXISTS programme_id;

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'user_profiles' AND constraint_name = 'chk_user_profiles_field_of_study'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT chk_user_profiles_field_of_study
            CHECK (field_of_study IS NULL OR field_of_study IN (
                'Accounting and finance',
                'Agriculture, forestry, fisheries and veterinary',
                'Architecture and building',
                'Arts and design',
                'Audio-visual techniques and media production',
                'Business and administration',
                'Communication and broadcasting',
                'Computing',
                'Education',
                'Engineering and engineering trades',
                'Environmental protection and conservation',
                'Hospitality and tourism',
                'Humanities',
                'Languages',
                'Law',
                'Manufacturing and processing',
                'Marketing and sales',
                'Mathematics and statistics',
                'Medicine and health',
                'Medical diagnostic and treatment technology',
                'Occupational health and safety',
                'Personal services',
                'Science (Biological sciences and physical sciences)',
                'Security and protective services',
                'Social sciences',
                'Social services',
                'Transport services'
            ));
    END IF;
END $$;

-- current_semester — distinct from current_year (year 1-8); most
-- Malaysian institutions run 2-3 semesters per academic year.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS current_semester SMALLINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'user_profiles' AND constraint_name = 'chk_user_profiles_current_semester'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT chk_user_profiles_current_semester
            CHECK (current_semester IS NULL OR current_semester BETWEEN 1 AND 3);
    END IF;
END $$;
