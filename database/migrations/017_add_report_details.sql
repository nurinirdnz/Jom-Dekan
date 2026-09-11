-- =====================================================================
-- Migration 016: Report submission details
-- JomDekan — adds a structured category and reporter contact fields to
-- the existing `reports` table (migration 004, Person E's module) so a
-- user-filed report carries a real reason category and a way to reach
-- them back, rather than free text. Nothing here touches entity_type/
-- entity_id/reporter_id/reason/status — the admin-side moderation
-- queue (moderationModel.ts) keeps working against those unchanged.
-- =====================================================================

ALTER TABLE reports
    ADD COLUMN IF NOT EXISTS category VARCHAR(40) NOT NULL DEFAULT 'OTHER'
        CHECK (category IN (
            'INAPPROPRIATE_CONTENT',
            'COPYRIGHT_VIOLATION',
            'PLAGIARISM',
            'ACADEMIC_DISHONESTY',
            'SPAM_OR_SCAM',
            'HARASSMENT',
            'MISINFORMATION',
            'OTHER'
        )),
    ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(120) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS reporter_phone VARCHAR(30) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS reporter_email VARCHAR(255) NOT NULL DEFAULT '';

-- The defaults above exist only so this ALTER succeeds against any
-- existing rows; every new report must supply real values going
-- forward (enforced by the app-level validator, not the DB default).
ALTER TABLE reports ALTER COLUMN category DROP DEFAULT;
ALTER TABLE reports ALTER COLUMN reporter_name DROP DEFAULT;
ALTER TABLE reports ALTER COLUMN reporter_phone DROP DEFAULT;
ALTER TABLE reports ALTER COLUMN reporter_email DROP DEFAULT;

CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
