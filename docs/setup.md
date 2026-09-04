# JomDekan — Setup Guide (beginner-friendly)

This walks through running JomDekan on your own machine from a clean
checkout. It assumes no prior knowledge of this specific project.

## 1. Software you need

- **Node.js 20+** and **npm** — check with `node -v` (should print
  `v20.x` or newer).
- **PostgreSQL 16** — either installed locally, or via Docker (see
  step 2).
- **Docker Desktop** (optional but recommended) — makes step 2 a
  single command.
- **Git**.

## 2. Start PostgreSQL (and Redis, for later milestones)

From the repository root:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` (user `postgres`, password
`postgres`, database `jomdekan`) and Redis on `localhost:6379`.

Don't have Docker? Install PostgreSQL 16 yourself and create a
database:

```bash
createdb jomdekan
```

## 3. Backend: install, configure, migrate, seed

```bash
cd backend
cp .env.example .env
npm install
npm run migrate   # applies database/migrations/*.sql
npm run seed      # optional: sample universities/subjects for local testing
```

Open `.env` and adjust values if your Postgres isn't using the
defaults above. At minimum, set real random values for
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET` — e.g.:

```bash
openssl rand -hex 32
```

Start the API:

```bash
npm run dev
```

You should see `JomDekan API listening on port 3000 (development)`.
Visit `http://localhost:3000/api/v1/docs` for interactive Swagger
docs, or `http://localhost:3000/health` for a quick liveness check.

## 4. Frontend: install, configure, run

In a **second terminal**:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173`. You should see the JomDekan landing
page. Register an account — it logs you straight into a dashboard
shell.

## 5. Create the first admin account

Public registration can never create an `ADMIN` — this is
intentional. To promote an account you've already registered:

```bash
cd backend
npm run create-admin -- --email you@example.com
```

## 6. Running tests and builds

Backend:

```bash
cd backend
npm run lint
npm run typecheck
createdb jomdekan_test          # once, if you haven't already
DB_NAME=jomdekan_test npm run migrate
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

Frontend E2E (both servers must already be running against a migrated
database, from steps 3–4):

```bash
cd frontend
npx playwright install --with-deps chromium   # first time only
npm run test:e2e
```

## 7. Opening this project in VS Code

See the root `README.md`'s "Open in VS Code" section for editor setup,
recommended extensions, and a two-terminal launch routine.

## 8. Common problems

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend crashes immediately with "Environment validation failed" | A required `.env` value is missing/too short | Re-check `backend/.env` against `backend/.env.example`; secrets must be ≥32 chars |
| `ECONNREFUSED` connecting to Postgres | Postgres isn't running, or wrong host/port | `docker compose up -d`, or check `DB_HOST`/`DB_PORT` in `backend/.env` |
| CORS error in the browser console | Frontend origin doesn't match `CORS_ORIGINS` | Ensure `backend/.env`'s `CORS_ORIGINS` includes `http://localhost:5173` |
| Login works but a page refresh logs you out | Expected for the access token (by design, kept in memory) — but if `useSessionBootstrap` doesn't restore it | Check the `jomdekan_rt` cookie exists (DevTools → Application → Cookies) and that the backend and frontend are both on `localhost` (cookies won't cross to a different host/IP) |
| `npm install` fails on Windows with native build errors | Some transitive dependency needs build tools | Install "Desktop development with C++" (Windows) or use WSL2 (recommended) — see below |
| Using WSL2 | Files on the Windows filesystem (`/mnt/c/...`) are slow for `npm` | Clone the repo inside the WSL2 filesystem (e.g. `~/projects/jomdekan`), not under `/mnt/c` |
| Docker Desktop won't start on Windows | WSL2 backend not enabled | Enable WSL2 in Docker Desktop settings, or install PostgreSQL natively instead (see step 2) |
| `pg_isready`/migrate hangs | Postgres container still starting | Wait a few seconds and retry; `docker compose ps` shows health status |
| Swagger UI shows no routes | You're in `NODE_ENV=production` | Swagger is dev-only by design; run with `npm run dev` |
