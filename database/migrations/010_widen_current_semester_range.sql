-- =====================================================================
-- Migration 010: Widen current_semester to 1-10
-- JomDekan — migration 008 originally capped current_semester at 3
-- (regular + short semester). Widened to 1-10 so it comfortably covers
-- every institution's numbering scheme.
-- =====================================================================
-- Idempotent-safe: uses IF EXISTS / DO blocks so it can be re-run.

ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS chk_user_profiles_current_semester;

ALTER TABLE user_profiles
    ADD CONSTRAINT chk_user_profiles_current_semester
    CHECK (current_semester IS NULL OR current_semester BETWEEN 1 AND 10);
