-- =====================================================================
-- Migration 006: Forum (posts, comments, voting)
-- JomDekan — Milestone 5 (Discovery: forum)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database.
--
-- NOTE ON NUMBERING: 001-005 are taken (005 = favorites). This is 006.

CREATE TABLE IF NOT EXISTS forum_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    -- Soft delete — matches users.deleted_at / taxonomy's archive
    -- convention, not resources' hard-delete exception. Forum content
    -- stays recoverable/auditable.
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);

DROP TRIGGER IF EXISTS trg_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER trg_forum_posts_updated_at BEFORE UPDATE ON forum_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- forum_comments — flat. Belongs to a post only, never to another
-- comment (no parent_comment_id).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forum_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT NOT NULL,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_comments_post ON forum_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);

DROP TRIGGER IF EXISTS trg_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER trg_forum_comments_updated_at BEFORE UPDATE ON forum_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- votes — bare/generic name (matching reports/notifications/audit_logs'
-- cross-cutting style), in case a future slice adds more votable
-- content types. target_id has no FK — it can't point at two different
-- tables at once, the same structural limitation reports.entity_id has.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('forum_post', 'forum_comment')),
    target_id   UUID NOT NULL,
    value       SMALLINT NOT NULL CHECK (value IN (-1, 1)),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- One vote per user per item, enforced at the database level — a
    -- double-click or replayed request cannot inflate a score. Changing
    -- your vote's direction is handled by the service layer via
    -- INSERT ... ON CONFLICT DO UPDATE against this exact constraint,
    -- not by allowing a second row.
    UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);

DROP TRIGGER IF EXISTS trg_votes_updated_at ON votes;
CREATE TRIGGER trg_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
