-- =====================================================================
-- Migration 014: Polymorphic favorites
-- JomDekan — widens favorites from resources-only to also cover forum
-- posts and marketplace opportunities (tutoring/freelance), mirroring
-- the target_type/target_id pattern migration 006 already established
-- for votes. Existing resource_id rows are migrated into the new shape
-- automatically; resource_id itself is then dropped in favor of the
-- generic columns.
--
-- No FK on target_id, same structural reason as votes.target_id — it
-- can't point at three different tables at once. Unlike the old
-- resource_id FK (ON DELETE CASCADE), cleanup on resource deletion is
-- now handled explicitly in resourceService.remove() instead of by the
-- database; forum posts only ever soft-delete and opportunities have no
-- delete path at all, so neither needs the same treatment.
-- =====================================================================

ALTER TABLE favorites
    ADD COLUMN IF NOT EXISTS target_type VARCHAR(20) NOT NULL DEFAULT 'resource'
        CHECK (target_type IN ('resource', 'forum_post', 'opportunity')),
    ADD COLUMN IF NOT EXISTS target_id UUID;

UPDATE favorites SET target_id = resource_id WHERE target_id IS NULL;

ALTER TABLE favorites ALTER COLUMN target_id SET NOT NULL;

ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_resource_id_key;
ALTER TABLE favorites ADD CONSTRAINT favorites_user_target_key UNIQUE (user_id, target_type, target_id);

DROP INDEX IF EXISTS idx_favorites_resource;
CREATE INDEX IF NOT EXISTS idx_favorites_target ON favorites(target_type, target_id);

ALTER TABLE favorites DROP COLUMN IF EXISTS resource_id;
