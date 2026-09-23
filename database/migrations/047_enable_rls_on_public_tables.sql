-- =====================================================================
-- Migration 047: Enable row level security on every public table
-- =====================================================================
-- Supabase exposes the public schema through its Data API (PostgREST)
-- to the anon/authenticated roles. JomDekan never uses that API — the
-- backend talks to Postgres directly as the table owner, which bypasses
-- RLS — so turning RLS on with no policies simply denies all Data API
-- access while leaving the backend untouched.
--
-- The loop covers every table that exists at run time, including
-- schema_migrations. Tables created by later migrations must enable
-- RLS themselves (ALTER TABLE ... ENABLE ROW LEVEL SECURITY).

DO $$
DECLARE
    t RECORD;
BEGIN
    FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
    END LOOP;

    -- Defence in depth on Supabase: strip the API roles' table grants too.
    -- Guarded because plain local Postgres (docker) has no such roles.
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
        REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    END IF;
END
$$;
