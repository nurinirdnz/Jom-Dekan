-- =====================================================================
-- Migration 007: Registration onboarding fields
-- JomDekan — extends registration to collect academic role, current
-- year of study, and Terms & Conditions acceptance.
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS / DO blocks so it can be re-run
-- against a clean database. 001-006 are taken; this is 007.

-- users.terms_accepted_at — mirrors email_verified_at's pattern (a
-- nullable timestamp on the identity row). Nullable at the column level
-- so this migration never fails against existing rows; the application
-- layer requires it to be set on every new registration going forward.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;

-- user_profiles.academic_role — distinct from users.role (USER/ADMIN,
-- system access level, never settable at registration). This is the
-- student's self-declared academic role, safe to collect at signup.
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS academic_role VARCHAR(20) NOT NULL DEFAULT 'STUDENT';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'user_profiles' AND constraint_name = 'chk_user_profiles_academic_role'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT chk_user_profiles_academic_role
            CHECK (academic_role IN ('STUDENT', 'TUTOR'));
    END IF;
END $$;

-- user_profiles.current_year — numeric year of study (1-8), distinct
-- from the existing categorical study_level (DIPLOMA/DEGREE/etc).
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS current_year SMALLINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'user_profiles' AND constraint_name = 'chk_user_profiles_current_year'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT chk_user_profiles_current_year
            CHECK (current_year IS NULL OR current_year BETWEEN 1 AND 8);
    END IF;
END $$;
