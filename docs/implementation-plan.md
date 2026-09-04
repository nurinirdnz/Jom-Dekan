# JomDekan — Implementation Plan

Status as of this session. Milestones follow the build prompt's
implementation order exactly.

## Milestone 0 — Foundation — ✅ DONE

- Repository structure (`backend/`, `frontend/`, `database/`, `docs/`)
  matching the Architecture Guide skill, adapted for JomDekan.
- Express app: typed env validation (Zod, fails fast at startup),
  request IDs, pino structured logging with secret redaction, CORS
  (explicit origins), Helmet + CSP, compression, cookie parsing,
  global + auth-specific rate limiting, consistent JSON error shape.
- `GET /health`, `/health/live`, `/health/ready` (checks DB), `/version`.
- Swagger/OpenAPI at `/api/v1/docs` (dev only).
- PostgreSQL connection pool (`pg`), migration runner
  (`npm run migrate`), seed runner (`npm run seed`).
- React + TypeScript + Vite shell: React Router, Tailwind (JomDekan
  palette), TanStack Query provider, Zustand store, Axios instance
  with interceptors.
- Testing scaffolding: Jest + Supertest (backend), Vitest + React
  Testing Library (frontend), Playwright config (frontend E2E).
- Docker Compose (Postgres + Redis) for local dev.
- GitHub Actions CI (lint, typecheck, test, build — both packages).

## Milestone 1 — Authentication and profiles — ✅ CORE SLICE DONE

Implemented:

- `POST /api/v1/auth/register`, `/login`, `/refresh`, `/logout`,
  `GET /me`.
- bcrypt (cost 12) password hashing; passwords never logged or
  returned.
- Case-insensitive unique email (Postgres `citext`).
- Short-lived access JWT (body only) + rotated, hashed refresh-token
  sessions in HttpOnly/Secure/SameSite=Strict cookies; reuse detection
  revokes the session family.
- `USER`/`ADMIN` roles; public registration can never set `role`
  (Zod `.strict()` schema rejects the field outright).
- `authenticate` / `authorize(...)` / `optionalAuthenticate`
  middleware; `ProtectedRoute` on the frontend.
- Audit log entries for register/login.
- `scripts/createAdmin.ts` — the only path to the first ADMIN account.
- Frontend: Login/Register pages (React Hook Form + Zod), silent
  session bootstrap on load, Dashboard shell behind `ProtectedRoute`.
- Tests: Zod validator unit tests; Supertest integration tests
  (register/duplicate/login/wrong-password/me/unknown-field-rejection).

Not yet implemented (explicitly out of this slice, tracked here so
they aren't lost):

- Email verification send/confirm flow (`email_verification_tokens`
  table exists; no endpoint yet).
- Forgot/reset password flow (`password_reset_tokens` table exists;
  no endpoint yet — must return a generic response regardless of
  whether the email exists, per the prompt's requirement).
- Avatar upload (depends on Milestone 3's storage adapter).
- Academic onboarding fields on `user_profiles` (university/programme
  pickers) — needs Milestone 2's taxonomy endpoints first.
- Google OAuth/OIDC (explicitly deferred until password auth is
  stable, per the prompt).
- CSRF token middleware — current design relies on `SameSite=Strict` +
  bearer-header access tokens (see `docs/architecture.md`); revisit if
  any state-changing endpoint becomes cookie-only.

## Milestone 2 — Academic taxonomy — NOT STARTED

Tables already exist (`universities`, `faculties`, `programmes`,
`subjects`, `programme_subjects`) with seed examples (UiTM, Computer
Science, Law, CSC510). Needed: admin CRUD routes/services/controllers,
public read-only browse endpoints, frontend pickers for onboarding.

## Milestone 3 — Resources and secure files — NOT STARTED

Needs: `resources`, `resource_files`, `resource_questions`,
`resource_answers`, `tags`/`resource_tags` migration
(`002_create_resources.sql`); real `StorageAdapter` implementation
(S3/R2/Supabase Storage) behind `backend/src/config/config/storage.ts`;
upload-intent → client upload → confirm → scan-stub → ready flow;
signed download URLs.

## Milestone 4 — Search, filters, favorites, collections — NOT STARTED

Needs Milestone 3 data. Postgres full-text (`tsvector` + GIN) and
trigram search; server-side pagination (`data` + `meta`); URL-encoded
filter state on the frontend.

## Milestone 5 — Questions, answers, forum — NOT STARTED

Needs `003_create_community.sql` (forum_posts/comments/votes/follows).

## Milestone 6 — Notifications and admin moderation — NOT STARTED

Needs `004_create_moderation_and_events.sql`
(reports/moderation_actions/notifications); Redis/BullMQ wiring
(`config/redis.ts` currently a placeholder); email adapter beyond the
`console` stub.

## Milestone 7 — Tutor and opportunity extension — NOT STARTED

## Milestone 8 — Responsible recommendation extension — NOT STARTED

---

## Exact next vertical slice (continue here)

**Milestone 1 completion — password reset flow**, because it's the
highest-risk remaining auth gap (account-recovery is a common attack
surface) and it's self-contained:

1. `password_reset_tokens` table already exists (migration 001) —
   confirm indexes are sufficient once request volume is known.
2. `POST /api/v1/auth/forgot-password` — always returns a generic
   "if that email exists, we sent a link" response; internally: find
   user by email, if found generate a random token, store its SHA-256
   hash + expiry, queue/console-log the email (using
   `EMAIL_PROVIDER=console` for now).
3. `POST /api/v1/auth/reset-password` — validates the token hash +
   expiry + unused, hashes and sets the new password, marks the token
   used, revokes all existing sessions for that user (force re-login
   everywhere).
4. Zod validators, Supertest coverage (valid token, expired token,
   reused token, non-existent email still returns 200).
5. Frontend `ForgotPassword.tsx` / `ResetPassword.tsx` pages + service
   methods + hook.
6. Update this file and `docs/requirements-traceability.md`.

After that: Milestone 2 (taxonomy CRUD), unblocking real onboarding
and, later, Milestone 3's resource metadata.

## Continuation prompt

```text
Continue building JomDekan in the existing repository. Before editing, invoke and read the Project Structure and Architecture Guide Claude Skill, then read README.md, docs/implementation-plan.md, docs/requirements-traceability.md, the JomDekan proposal PDF, and the endpoint Markdown. Inspect the repository and git diff, and run relevant verification commands. Confirm that the project still uses the mandatory frontend/, backend/, and database/ structure and the flow React component → hook → frontend service → Axios → Express route → middleware → controller → service → model → PostgreSQL. Resume the first incomplete vertical slice. Preserve completed and unrelated work. Implement it end-to-end with SQL, backend, frontend, authorization, tests, Swagger, and docs. Fix failures before proceeding. Keep future features outside the MVP until the core definition of done passes. End with changed files, migration notes, commands/results, manual test steps, limitations, and the next slice.
```
