-- =====================================================================
-- Migration 003: Full-text search on resources
-- JomDekan — Milestone 4 (Discovery: resource search/filter)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database.
--
-- NOTE ON NUMBERING: this migration claims 003_. docs/implementation-plan.md
-- had pencilled in 003_create_community.sql for the forum tables
-- (forum_posts/comments/votes/follows) — that and the favorites migration
-- both need to move to 004_ or later. Coordinate before adding another 003_.

-- ---------------------------------------------------------------------
-- resources.search_vector — generated tsvector over title + description,
-- title weighted higher ('A') than description ('B'). pg_trgm was
-- enabled back in migration 001 for this purpose; full-text search (not
-- trigram) is used here for relevance ranking, with trigram fuzzy
-- matching left as a possible future addition on top of this column.
-- ---------------------------------------------------------------------
ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_resources_search_vector ON resources USING GIN (search_vector);

-- ---------------------------------------------------------------------
-- Composite index for the default (no-q) browse query, which already
-- filters on status and sorts by created_at DESC.
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_resources_status_created_at ON resources(status, created_at DESC);
