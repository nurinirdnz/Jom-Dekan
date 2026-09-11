-- =====================================================================
-- Migration 015: Forum post solved state
-- JomDekan — a thread's author can mark it solved/unsolved, independent
-- of reply count ("Unanswered" stays a separate, real-reply-count-based
-- concept). Nullable timestamp rather than a boolean, matching the
-- deleted_at convention already used on forum_posts/forum_comments —
-- also gives "solved N ago" for free later if ever needed.
-- =====================================================================

ALTER TABLE forum_posts
    ADD COLUMN IF NOT EXISTS solved_at TIMESTAMPTZ;
