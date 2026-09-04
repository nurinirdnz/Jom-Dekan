# JomDekan — Requirements Traceability (Milestone 0/1)

Maps each implemented MVP requirement to its frontend page, service,
API route, controller/service/model, database tables, permissions, and
tests. Extend this table as each new vertical slice lands — do not let
it drift from the code.

| Req | Frontend page | Frontend service/hook | API route | Controller → Service → Model | DB tables | Permissions | Tests |
|-----|----------------|------------------------|-----------|-------------------------------|-----------|--------------|-------|
| FR-01 (register) | `pages/Register.tsx` | `service/authService.ts` → `hooks/useAuth.ts` (`useRegister`) | `POST /api/v1/auth/register` | `authController.register` → `authService.register` → `userModel.create` | `users`, `user_profiles`, `user_sessions`, `audit_logs` | Public. Cannot set `role` (schema `.strict()`). | `tests/integration/auth.test.ts`, `tests/unit/authValidators.test.ts` |
| FR-01 (login) | `pages/Login.tsx` | `service/authService.ts` → `hooks/useAuth.ts` (`useLogin`) | `POST /api/v1/auth/login` | `authController.login` → `authService.login` → `userModel.findByEmail` | `users`, `user_sessions`, `audit_logs` | Public. `403` if account not `ACTIVE`. | `tests/integration/auth.test.ts` |
| FR-01 (session refresh) | `hooks/useSessionBootstrap.ts`, `api/axiosInstance.ts` (401 interceptor) | `service/authService.ts` (`refresh`) | `POST /api/v1/auth/refresh` | `authController.refresh` → `authService.refresh` → `sessionModel` | `user_sessions` | Requires valid, non-revoked, non-expired refresh cookie. Reuse of a revoked token revokes the whole session family. | manual (integration test for this path is a documented gap — see below) |
| FR-01 (logout) | `components/common/Header.tsx` (log-out button) | `service/authService.ts` (`logout`) → `hooks/useAuth.ts` (`useLogout`) | `POST /api/v1/auth/logout` | `authController.logout` → `authService.logout` → `sessionModel.revoke` | `user_sessions` | Idempotent; no auth required (cookie is what's revoked, if present). | manual |
| FR-01 (current user / protected routes) | `components/common/ProtectedRoute.tsx`, `pages/Dashboard.tsx` | `useAuthStore` (client state) | `GET /api/v1/auth/me` | `authController.me` → `authService.getCurrentUser` → `userModel.findById` | `users` | Requires Bearer access token (`authenticate` middleware). | `tests/integration/auth.test.ts` |
| NFR — security (password hashing) | — | — | (all of the above) | `authService` uses `bcrypt.hash(..., 12)`; hash never returned in any response (`toSafeUser`) | `users.password_hash` | — | code review + `tests/integration/auth.test.ts` asserts `passwordHash` absent from response |
| NFR — security (roles) | — | — | — | `authorize(...)` middleware (`config/middleware/authorizeMiddleware.ts`) — not yet exercised by any route in this slice | `users.role` | Reserved for Milestone 2+ admin routes | none yet — add when the first admin-only route ships |
| NFR — accessibility | `pages/Login.tsx`, `pages/Register.tsx` | — | — | — | — | Labeled inputs, `aria-invalid`/`aria-describedby`, visible focus rings, `role="alert"` on server errors | `tests/Login.test.tsx` (label + validation-message assertions) |
| NFR — API docs | — | — | `/api/v1/docs` | Swagger JSDoc on every route in `authRoutes.ts`, `healthRoutes.ts` | — | dev-only | manual (open Swagger UI) |
| NFR — audit trail | — | — | — | `auditLogModel.record` called from `authService.register`/`login` | `audit_logs` | Append-only; no update/delete function exists | none yet — add an assertion once an admin audit-read endpoint exists |

## Known gaps in this slice (tracked, not silently dropped)

- No automated test exercises `/auth/refresh` end-to-end (cookie
  round-trip is awkward with Supertest's default client) or the
  reuse-detection path. Both are covered by the *design* (see
  `docs/architecture.md`) but not yet by an integration test —
  flagged here rather than claimed as done.
- `Pasted markdown(7).md` (the long-term endpoint catalogue named as
  mandatory source #3 in the build prompt) was not among this
  session's attachments. Route names above were derived from the
  proposal PDF and the architecture skill only. Reconcile against the
  real catalogue before Milestone 2.
- Email verification and password reset are modeled in the database
  (tables exist) but have no endpoints yet — see
  `docs/implementation-plan.md`'s "next vertical slice".
