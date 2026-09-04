import request from 'supertest';
import { createApp } from '../../src/app';
import { pool } from '../../src/config/config/db';

/**
 * Integration tests against a real PostgreSQL test database. Requires
 * DB_NAME=jomdekan_test (see tests/setupEnv.ts) to be migrated first:
 *
 *   createdb jomdekan_test
 *   DB_NAME=jomdekan_test npm --prefix backend run migrate
 *   DB_NAME=jomdekan_test npm --prefix backend test
 *
 * Skipped automatically (not failed) if the test database is
 * unreachable, so `npm test` doesn't hard-fail in an environment with
 * no PostgreSQL — but the suite provides no coverage in that case, so
 * CI must provision the database (see .github/workflows/ci.yml).
 */
const app = createApp();

async function dbReachable(): Promise<boolean> {
  try {
    await pool.query('SELECT 1 FROM users LIMIT 1');
    return true;
  } catch {
    return false;
  }
}

describe('Auth API', () => {
  let skip = false;

  beforeAll(async () => {
    skip = !(await dbReachable());
    if (skip) {
      // eslint-disable-next-line no-console
      console.warn('Skipping auth integration tests: jomdekan_test database is not migrated/reachable.');
    }
  });

  afterAll(async () => {
    await pool.end();
  });

  const testEmail = `test-${Date.now()}@example.com`;

  it('registers a new user and returns an access token', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: 'correcthorsebattery',
      displayName: 'Test Student',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.passwordHash).toBeUndefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });

  it('rejects duplicate registration with 409', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/register').send({
      email: testEmail,
      password: 'correcthorsebattery',
      displayName: 'Test Student',
    });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects login with the wrong password using 401 (never reveals which field was wrong)', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'totally-wrong-password',
    });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('logs in with correct credentials and can call /auth/me with the access token', async () => {
    if (skip) return;
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testEmail,
      password: 'correcthorsebattery',
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken as string;

    const meRes = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testEmail);
  });

  it('rejects /auth/me without a token', async () => {
    if (skip) return;
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects registration payloads with unknown fields', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/register').send({
      email: `other-${Date.now()}@example.com`,
      password: 'correcthorsebattery',
      displayName: 'Sneaky',
      role: 'ADMIN',
    });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
