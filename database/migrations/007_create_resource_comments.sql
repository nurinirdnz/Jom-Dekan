-- =====================================================================
-- Migration 007: Comments on academic resources
-- =====================================================================

CREATE TABLE IF NOT EXISTS resource_comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    author_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT NOT NULL CHECK (length(trim(body)) > 0),
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_comments_resource
    ON resource_comments(resource_id, created_at ASC);

DROP TRIGGER IF EXISTS trg_resource_comments_updated_at ON resource_comments;
CREATE TRIGGER trg_resource_comments_updated_at BEFORE UPDATE ON resource_comments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
