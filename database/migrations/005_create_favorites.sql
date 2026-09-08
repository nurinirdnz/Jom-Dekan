-- =====================================================================
-- Migration 005: Favorites
-- JomDekan — Milestone 4 (Discovery: favorites)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database.
--
-- NOTE ON NUMBERING: 003_ and 004_ are already taken (resource search,
-- moderation/marketplace). The forum migration should be 006_ or later —
-- coordinate before claiming a number.

CREATE TABLE IF NOT EXISTS favorites (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resource_id  UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- One favorite per user per resource, enforced at the database level
    -- (not just checked in application code) — a double-click or replayed
    -- request cannot create a duplicate row; the second attempt fails
    -- this constraint, and the service layer (Step 5) treats that as
    -- "already favorited" rather than an error.
    UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_resource ON favorites(resource_id);
