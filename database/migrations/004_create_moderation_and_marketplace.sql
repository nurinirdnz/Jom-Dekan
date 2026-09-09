-- =====================================================================
-- Migration 004: Notifications, reports/moderation queue, and the
-- tutor/opportunity marketplace
-- JomDekan — Person E's module (Notifications, Moderation, Admin
-- Actions, Tutor/Marketplace)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database.

-- ---------------------------------------------------------------------
-- resources.moderation_status — separate from resources.status (which
-- tracks upload/processing state, not content review). Nothing sets a
-- resource to 'pending_moderation' automatically yet; only a future
-- report-handling flow would.
-- ---------------------------------------------------------------------
ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'approved'
        CHECK (moderation_status IN ('approved', 'pending_moderation', 'rejected', 'quarantined'));

CREATE INDEX IF NOT EXISTS idx_resources_moderation_status ON resources(moderation_status);

-- ---------------------------------------------------------------------
-- notifications — per-user, read/unread. No code path inserts into
-- this yet (that's a separate future feature); this just lets the
-- /notifications endpoints run and return an empty list instead of
-- erroring on a missing table.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50) NOT NULL,
    payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- ---------------------------------------------------------------------
-- reports — user-submitted flags feeding the admin moderation queue
-- alongside pending resources.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason      TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ---------------------------------------------------------------------
-- opportunities — tutor/study-group/mentorship marketplace listings.
-- Content only, no payments.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunities (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT NOT NULL,
    listing_type  VARCHAR(30) NOT NULL
                      CHECK (listing_type IN ('TUTORING', 'STUDY_GROUP', 'PROJECT_MENTORSHIP')),
    mode          VARCHAR(20) NOT NULL
                      CHECK (mode IN ('ONLINE', 'PHYSICAL', 'HYBRID')),
    status        VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'closed')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status, created_at DESC);

DROP TRIGGER IF EXISTS trg_opportunities_updated_at ON opportunities;
CREATE TRIGGER trg_opportunities_updated_at BEFORE UPDATE ON opportunities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- opportunity_applications — one application per (opportunity, user).
-- The UNIQUE constraint is load-bearing: opportunityController.ts
-- relies on the resulting Postgres 23505 error to return a 409
-- "already applied" response.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS opportunity_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_message   TEXT NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_opportunity_applications_opportunity ON opportunity_applications(opportunity_id);
