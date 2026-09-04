# JomDekan — API Reference (Milestone 0/1 scope)

Full interactive docs (Swagger/OpenAPI, generated from JSDoc comments
in `backend/src/routes/*.ts`) are served at
`http://localhost:3000/api/v1/docs` in development. This file is a
plain-text summary for quick reference; keep it in sync as routes are
added.

Base URL: `/api/v1`

## Error shape (all endpoints)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [{ "field": "email", "message": "Enter a valid email." }],
    "requestId": "req_..."
  }
}
```

Status codes: `400` validation, `401` unauthenticated, `403`
forbidden, `404` not found / concealed, `409` conflict, `429` rate
limited, `500` internal.

## System

| Method | Path            | Auth | Description                          |
|--------|-----------------|------|---------------------------------------|
| GET    | `/health`       | none | Basic liveness                        |
| GET    | `/health/live`  | none | Liveness probe                        |
| GET    | `/health/ready` | none | Readiness (checks DB connectivity)    |
| GET    | `/version`      | none | API version                           |

## Auth

| Method | Path                    | Auth        | Description |
|--------|-------------------------|-------------|-------------|
| POST   | `/api/v1/auth/register` | none        | Create a `USER` account. Body: `{ email, password, displayName }`. Rate-limited. Rejects unknown fields (e.g. `role`). |
| POST   | `/api/v1/auth/login`    | none        | Body: `{ email, password }`. Rate-limited. `401` on any mismatch (never reveals which field). |
| POST   | `/api/v1/auth/refresh`  | refresh cookie | Rotates the refresh token, returns a new access token + user. |
| POST   | `/api/v1/auth/logout`   | refresh cookie (optional) | Revokes the current session. Idempotent. |
| GET    | `/api/v1/auth/me`       | Bearer access token | Returns the current user. |

### Response shapes

`POST /auth/register`, `POST /auth/login` → `201`/`200`:
```json
{
  "message": "...",
  "user": { "id": "uuid", "email": "student@example.com", "role": "USER", "createdAt": "..." },
  "accessToken": "eyJ..."
}
```
A `Set-Cookie` header also carries the HttpOnly refresh token
(`jomdekan_rt`, path `/api/v1/auth`) — never present in the JSON body.

`POST /auth/refresh` → `200`:
```json
{ "user": { ... }, "accessToken": "eyJ..." }
```

`GET /auth/me` → `200`:
```json
{ "user": { "id": "uuid", "email": "...", "role": "USER", "createdAt": "..." } }
```

## Long-term endpoint catalogue

The build prompt references a `Pasted markdown(7).md` REST endpoint
catalogue as the long-term authority for route names and
implementation order across all milestones. That file was not
provided in this session's attachments — only the architecture guide
skill and the system-proposal PDF were available. Milestone 0/1 routes
above were designed directly from the proposal PDF's role/permission
and system-flow sections instead. **Before implementing Milestone 2
onward, obtain that endpoint catalogue (or confirm route names with
the team) so naming stays consistent with the long-term plan** — see
`docs/requirements-traceability.md` for the same caveat.
