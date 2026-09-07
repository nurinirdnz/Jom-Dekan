-- =====================================================================
-- Migration 002: Resources and secure file uploads
-- JomDekan — Milestone 3 (uploading/browsing academic resources)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database. v1 scope is deliberately one file per resource —
-- resource_files is still a child table (not columns on resources) so
-- a future "add another file" feature is additive, not a rewrite.

-- ---------------------------------------------------------------------
-- resources
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resources (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_id       UUID REFERENCES universities(id) ON DELETE SET NULL,
    faculty_id          UUID REFERENCES faculties(id) ON DELETE SET NULL,
    programme_id        UUID REFERENCES programmes(id) ON DELETE SET NULL,
    subject_id          UUID REFERENCES subjects(id) ON DELETE SET NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'READY', 'ARCHIVED', 'FAILED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resources_owner ON resources(owner_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_university ON resources(university_id);
CREATE INDEX IF NOT EXISTS idx_resources_faculty ON resources(faculty_id);
CREATE INDEX IF NOT EXISTS idx_resources_programme ON resources(programme_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject_id);

-- ---------------------------------------------------------------------
-- resource_files — storage_key is always server-generated (never
-- derived from the client's filename), so path traversal via a
-- crafted filename is structurally impossible. original_filename is
-- display metadata only, never used to build a filesystem path.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resource_files (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id         UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    storage_key         TEXT NOT NULL UNIQUE,
    original_filename   TEXT NOT NULL,
    declared_mime_type  TEXT NOT NULL,
    detected_mime_type  TEXT,
    size_bytes          BIGINT NOT NULL,
    checksum_sha256     TEXT,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING', 'UPLOADED', 'READY', 'FAILED')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resource_files_resource ON resource_files(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_files_status ON resource_files(status);

-- ---------------------------------------------------------------------
-- updated_at triggers — reuse the shared function from migration 001,
-- do not redefine it here.
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_resources_updated_at ON resources;
CREATE TRIGGER trg_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_resource_files_updated_at ON resource_files;
CREATE TRIGGER trg_resource_files_updated_at BEFORE UPDATE ON resource_files
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
