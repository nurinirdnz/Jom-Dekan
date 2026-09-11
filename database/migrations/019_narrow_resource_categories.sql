-- =====================================================================
-- Migration 018: Narrow resource categories
-- JomDekan — removes VIDEO and OTHER from the category list, adds
-- EXCEL. Final set: PAST_PAPER, NOTES, SLIDES, ARTICLE, EXCEL.
--
-- Existing rows using a removed category (checked before writing this:
-- 4 rows were 'OTHER', 0 were 'VIDEO') are reassigned to ARTICLE — the
-- closest remaining "general write-up" bucket — before the constraint
-- is narrowed, so this migration is safe to run even though it's
-- tightening a CHECK rather than widening one.
-- =====================================================================

UPDATE resources SET category = 'ARTICLE' WHERE category IN ('VIDEO', 'OTHER');

ALTER TABLE resources DROP CONSTRAINT resources_category_check;
ALTER TABLE resources ADD CONSTRAINT resources_category_check
    CHECK (category IN ('PAST_PAPER', 'NOTES', 'SLIDES', 'ARTICLE', 'EXCEL'));
