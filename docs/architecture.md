# JomDekan — Architecture

## Layering (mandatory dependency flow)

```
React page/component
  → custom hook (TanStack Query)
    → frontend service (src/service/*.ts)
      → Axios instance (src/api/axiosInstance.ts)
        → Express route
          → validation middleware (Zod) + auth/authorize middleware
            → controller (thin — parses req, calls service, shapes response)
              → service (business rules, transactions, permissions)
                → model/repository (parameterized SQL, no req/res)
                  → PostgreSQL
        ← response flows back up through the same layers
```

Rules enforced throughout the codebase:

- **Routes** only define endpoints and middleware composition.
- **Controllers** stay thin: validated input in, service call, shaped response out.
- **Services** hold business rules, transactions, and permission-sensitive
  state changes. `authService.ts` is the reference implementation
  (registration, login, refresh-token rotation with reuse detection,
  logout).
- **Models/repositories** contain parameterized SQL only and never
  import `express`. They are callable from scripts (e.g.
  `scripts/createAdmin.ts`) as well as services.
- **Frontend components/pages never call Axios directly.** Every
  request goes through `frontend/src/service/*.ts`, consumed via a
  hook in `frontend/src/hooks/*.ts` (TanStack Query for anything that
  is server data).
- **Zustand** (`frontend/src/store/useAuthStore.ts`) holds only
  genuine client/UI state — here, the in-memory access token and the
  bootstrapped user object. It is not a cache for server data; the
  authoritative "who am I" fetch (`GET /auth/me`) is intended to be
  wired through TanStack Query once profile data grows beyond what the
  login/refresh response already returns.
- **No ORM.** SQL migrations in `database/migrations/` are the single
  source of schema truth.

## Why Express, not NestJS, and why a Node/pg pool, not Supabase SDK

The system proposal PDF's own recommended stack lists NestJS and
Supabase-managed Postgres. Per the build prompt's authority order,
security/architecture-guide requirements outrank the PDF's product-level
suggestions. The **Project Structure and Architecture Guide** skill —
authority #2 — specifies plain Express with hand-composed layers, and a
`pg` connection pool with parameterized SQL. This repository follows
the skill: Express + `pg`, not NestJS + Supabase SDK. The PDF's
relational, RLS-aware Postgres schema decisions (UUID PKs, `citext`
email, JSONB only for bounded/flexible data) are still followed, since
those are data-model requirements, not framework requirements — they
apply equally under a hand-rolled Express/pg stack.

Object storage: the PDF recommends Supabase Storage/S3/R2 behind
signed URLs. That contract is captured in
`backend/src/config/config/storage.ts` as a `StorageAdapter`
interface with a clearly-labelled `local-stub` implementation that
throws rather than silently pretending to upload — Milestone 3 swaps
in a real S3-compatible adapter.

## Milestone 0/1 request flow (implemented)

```
Browser (React/Vite SPA, :5173)
   │  Axios (withCredentials, Bearer access token in memory)
   ▼
Express API (:3000)
   requestId → pino logging → CORS → Helmet/CSP → compression
   → cookie-parser → /api/v1 rate limiter → routes
      /auth/register, /auth/login  (public, rate-limited)
      /auth/refresh                (reads httpOnly refresh cookie, rotates it)
      /auth/logout                 (revokes the session row)
      /auth/me                     (Bearer access token required)
   ▼
Services (authService) → Models (userModel, sessionModel, auditLogModel)
   ▼
PostgreSQL (users, user_profiles, user_sessions, audit_logs, taxonomy)
```

## Auth token design

- **Access token**: short-lived JWT (`JWT_ACCESS_EXPIRES_IN`, default
  15m), returned in the JSON body only, kept in frontend memory
  (`useAuthStore`) — never `localStorage`. Cleared on full page
  reload; `useSessionBootstrap` silently re-derives it from the
  refresh cookie on load.
- **Refresh token**: JWT signed with a separate secret, stored
  **hashed** (SHA-256) in `user_sessions.refresh_token_hash` — the
  plaintext token itself is never persisted server-side. Delivered to
  the browser only as an `HttpOnly; Secure (prod); SameSite=Strict`
  cookie scoped to `/api/v1/auth`, so page JavaScript can never read
  it.
- **Rotation**: every `/auth/refresh` call issues a brand-new refresh
  token and revokes the old session row, linking `replaced_by_id`.
  Presenting an already-revoked refresh token revokes the *entire*
  session family for that user (reuse-detection — a strong signal the
  token was stolen).
- CSRF: because the refresh cookie is `SameSite=Strict` and carries no
  authority on its own (a bare cookie without the matching session row
  and JWT signature does nothing), and the access token must be
  attached manually via `Authorization: Bearer`, cross-site requests
  cannot forge authenticated calls. Milestone 2+ should revisit this
  if any endpoint moves to cookie-only auth.

## What's deferred

Milestones 2–8 (taxonomy CRUD, resources/files, search, forum,
notifications/admin moderation, tutoring, recommendations) are staged
in `docs/implementation-plan.md` with their target file layout already
reserved in the directory tree, but not yet implemented. See that file
for the exact next vertical slice.
