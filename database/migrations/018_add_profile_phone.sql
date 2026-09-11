-- =====================================================================
-- Migration 017: Profile phone number
-- JomDekan — a real, persisted phone field on user_profiles so contact
-- info (e.g. for the report form) can genuinely auto-fill from the
-- user's account instead of being typed fresh every time. Nullable —
-- existing users have none yet, and it isn't mandatory to keep a
-- profile complete; forms that need it (like reports) enforce that
-- requirement themselves.
-- =====================================================================

ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS phone VARCHAR(30);
