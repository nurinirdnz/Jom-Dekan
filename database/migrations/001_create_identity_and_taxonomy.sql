-- =====================================================================
-- Migration 001: Identity, sessions, and academic taxonomy
-- JomDekan — Milestone 0/1 (foundation + authentication)
-- =====================================================================
-- Idempotent-safe: uses IF NOT EXISTS so it can be re-run against a
-- clean database. Migrations are otherwise treated as immutable once
-- deployed to a shared environment — create a new numbered file instead
-- of editing this one after it has shipped.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive email
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search (later milestones)

-- ---------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               CITEXT UNIQUE NOT NULL,
    password_hash       TEXT NOT NULL,
    role                VARCHAR(20) NOT NULL DEFAULT 'USER'
                            CHECK (role IN ('USER', 'ADMIN')),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RESTRICTED', 'DEACTIVATED')),
    auth_provider       VARCHAR(20) NOT NULL DEFAULT 'PASSWORD'
                            CHECK (auth_provider IN ('PASSWORD', 'GOOGLE')),
    email_verified_at   TIMESTAMPTZ,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ---------------------------------------------------------------------
-- user_profiles (1:1 with users)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id             UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name        VARCHAR(120) NOT NULL,
    photo_path           TEXT,
    university_id       UUID,               -- FK added below once universities exists
    programme_id        UUID,               -- FK added below once programmes exists
    study_level         VARCHAR(30),        -- e.g. DIPLOMA, DEGREE, MASTERS, PHD
    interests           JSONB NOT NULL DEFAULT '[]'::jsonb,
    privacy_prefs       JSONB NOT NULL DEFAULT '{}'::jsonb,
    notification_prefs  JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- oauth_accounts (Google OIDC — implemented after password auth is stable)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider            VARCHAR(20) NOT NULL CHECK (provider IN ('GOOGLE')),
    provider_subject    TEXT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_subject)
);

-- ---------------------------------------------------------------------
-- user_sessions — rotated refresh-token records (hashed, never plaintext)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  TEXT NOT NULL,
    user_agent          TEXT,
    ip_address          INET,
    expires_at          TIMESTAMPTZ NOT NULL,
    revoked_at          TIMESTAMPTZ,
    replaced_by_id      UUID REFERENCES user_sessions(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active
    ON user_sessions(user_id) WHERE revoked_at IS NULL;

-- ---------------------------------------------------------------------
-- email_verification_tokens / password_reset_tokens
-- Tokens are stored as a SHA-256 hash of a random value; only the hash
-- ever touches the database or logs.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    used_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_evt_user_id ON email_verification_tokens(user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash          TEXT NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ NOT NULL,
    used_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);

-- ---------------------------------------------------------------------
-- Academic taxonomy (created now so user_profiles FKs can attach;
-- full CRUD for these lands in Milestone 2)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS universities (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL UNIQUE,
    country             VARCHAR(100) NOT NULL DEFAULT 'Malaysia',
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faculties (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id       UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (university_id, slug)
);

CREATE TABLE IF NOT EXISTS programmes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id          UUID NOT NULL REFERENCES faculties(id) ON DELETE RESTRICT,
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL,
    study_level         VARCHAR(30),
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (faculty_id, slug)
);

CREATE TABLE IF NOT EXISTS subjects (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(30) NOT NULL,
    name                VARCHAR(200) NOT NULL,
    aliases             JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (code)
);

CREATE TABLE IF NOT EXISTS programme_subjects (
    programme_id        UUID NOT NULL REFERENCES programmes(id) ON DELETE CASCADE,
    subject_id          UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    recommended_year     SMALLINT,
    recommended_semester SMALLINT,
    curriculum_year      SMALLINT,
    PRIMARY KEY (programme_id, subject_id, curriculum_year)
);

-- Now that the taxonomy tables exist, attach the deferred FKs on user_profiles.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_profiles_university'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT fk_user_profiles_university
            FOREIGN KEY (university_id) REFERENCES universities(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_profiles_programme'
    ) THEN
        ALTER TABLE user_profiles
            ADD CONSTRAINT fk_user_profiles_programme
            FOREIGN KEY (programme_id) REFERENCES programmes(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_university ON user_profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_programme ON user_profiles(programme_id);

-- ---------------------------------------------------------------------
-- audit_logs — append-only, no update/delete route is ever exposed
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    action              VARCHAR(100) NOT NULL,
    target_type         VARCHAR(50),
    target_id           UUID,
    reason              TEXT,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    request_id          VARCHAR(64),
    ip_address          INET,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ---------------------------------------------------------------------
-- updated_at trigger helper, reused by every mutable table
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_universities_updated_at ON universities;
CREATE TRIGGER trg_universities_updated_at BEFORE UPDATE ON universities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_faculties_updated_at ON faculties;
CREATE TRIGGER trg_faculties_updated_at BEFORE UPDATE ON faculties
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_programmes_updated_at ON programmes;
CREATE TRIGGER trg_programmes_updated_at BEFORE UPDATE ON programmes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_subjects_updated_at ON subjects;
CREATE TRIGGER trg_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
