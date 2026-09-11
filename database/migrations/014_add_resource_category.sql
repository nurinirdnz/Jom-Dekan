-- =====================================================================
-- Migration 013: Resource category
-- JomDekan — required single-select category per resource (Past paper,
-- Notes, Slides, Video, Article, Other), so uploads can be classified
-- and browsed by type. Existing rows backfill to 'OTHER' via the
-- column default; new uploads must specify a real category through
-- application-level validation (the DB default exists only to make
-- this migration safe against existing rows, not as a way to skip it).
-- =====================================================================

ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'OTHER'
        CHECK (category IN ('PAST_PAPER', 'NOTES', 'SLIDES', 'VIDEO', 'ARTICLE', 'OTHER'));

CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
