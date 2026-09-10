import request from 'supertest';
import { createApp } from '../../src/app';
import { pool } from '../../src/config/config/db';
import { emailService } from '../../src/services/emailService';

/**
 * Integration tests against a real PostgreSQL test database. Requires
 * DB_NAME=jomdekan_test (see tests/setupEnv.ts) to be migrated AND
 * seeded first (registration now requires a real university):
 *
 *   createdb jomdekan_test
 *   DB_NAME=jomdekan_test npm --prefix backend run migrate
 *   DB_NAME=jomdekan_test npm --prefix backend run seed
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

function extractToken(emailText: string): string {
  const url = new URL(emailText.match(/https?:\/\/\S+/)![0]);
  return url.searchParams.get('token')!;
}

describe('Auth API', () => {
  let skip = false;
  let universityId: string;

  beforeAll(async () => {
    skip = !(await dbReachable());
    if (skip) {
      // eslint-disable-next-line no-console
      console.warn('Skipping auth integration tests: jomdekan_test database is not migrated/reachable.');
      return;
    }

    const { rows } = await pool.query<{ id: string }>(
      `SELECT id FROM universities WHERE slug = 'universiti-teknologi-mara'`,
    );
    if (!rows[0]) {
      skip = true;
      // eslint-disable-next-line no-console
      console.warn('Skipping auth integration tests: run `npm --prefix backend run seed` against the test database.');
      return;
    }
    universityId = rows[0].id;
  });

  afterAll(async () => {
    await pool.end();
  });

  const testEmail = `test-${Date.now()}@example.com`;

  function registerPayload(overrides: Record<string, unknown> = {}) {
    return {
      email: testEmail,
      password: 'correcthorsebattery',
      displayName: 'Test Student',
      academicRole: 'STUDENT',
      universityId,
      fieldOfStudy: 'Computing',
      currentYear: 2,
      currentSemester: 1,
      termsAccepted: true,
      ...overrides,
    };
  }

  it('registers a new user and returns an access token', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/register').send(registerPayload());

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.passwordHash).toBeUndefined();
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
  });

  it('rejects duplicate registration with 409', async () => {
    if (skip) return;
    const res = await request(app).post('/api/v1/auth/register').send(registerPayload());
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects registration without accepting the Terms & Conditions', async () => {
    if (skip) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ email: `noterms-${Date.now()}@example.com`, termsAccepted: false }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a university id that does not exist', async () => {
    if (skip) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(
        registerPayload({
          email: `baduniversity-${Date.now()}@example.com`,
          universityId: '99999999-9999-9999-9999-999999999999',
        }),
      );
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a field of study that is not one of the fixed options', async () => {
    if (skip) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(
        registerPayload({
          email: `badfield-${Date.now()}@example.com`,
          fieldOfStudy: 'Underwater Basket Weaving',
        }),
      );
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
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
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(registerPayload({ email: `other-${Date.now()}@example.com`, displayName: 'Sneaky', role: 'ADMIN' }));
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  describe('Password reset', () => {
    const resetTestEmail = `reset-test-${Date.now()}@example.com`;

    beforeAll(async () => {
      if (skip) return;
      await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload({ email: resetTestEmail, password: 'original-password', displayName: 'Reset Test' }));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('always returns 200 for forgot-password, whether or not the email is registered (no enumeration)', async () => {
      if (skip) return;
      jest.spyOn(emailService, 'sendEmail').mockResolvedValue();

      const known = await request(app).post('/api/v1/auth/forgot-password').send({ email: resetTestEmail });
      const unknown = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: `no-such-user-${Date.now()}@example.com` });

      expect(known.status).toBe(200);
      expect(unknown.status).toBe(200);
      expect(known.body.message).toBe(unknown.body.message);
    });

    it('resets the password end-to-end and revokes existing sessions', async () => {
      if (skip) return;
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: resetTestEmail, password: 'original-password' });
      expect(loginRes.status).toBe(200);
      const oldSessionCookie = loginRes.headers['set-cookie'];

      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue();
      await request(app).post('/api/v1/auth/forgot-password').send({ email: resetTestEmail });
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      const token = extractToken(sendEmailSpy.mock.calls[0][0].text);

      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token, newPassword: 'brand-new-password' });
      expect(resetRes.status).toBe(200);

      // The old session must not survive a password reset.
      const refreshRes = await request(app).post('/api/v1/auth/refresh').set('Cookie', oldSessionCookie);
      expect(refreshRes.status).toBe(401);

      // Old password no longer works; new password does.
      const oldLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: resetTestEmail, password: 'original-password' });
      expect(oldLogin.status).toBe(401);

      const newLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: resetTestEmail, password: 'brand-new-password' });
      expect(newLogin.status).toBe(200);

      // The reset token is single-use.
      const reuseRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token, newPassword: 'yet-another-password' });
      expect(reuseRes.status).toBe(400);
    });

    it('rejects an invalid or unknown reset token with 400', async () => {
      if (skip) return;
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'not-a-real-token', newPassword: 'whatever-password' });
      expect(res.status).toBe(400);
    });
  });

  describe('Email verification', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('sends a verification email on register and confirms the account with its token', async () => {
      if (skip) return;
      const sendEmailSpy = jest.spyOn(emailService, 'sendEmail').mockResolvedValue();

      const verifyTestEmail = `verify-test-${Date.now()}@example.com`;
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload({ email: verifyTestEmail }));
      expect(registerRes.status).toBe(201);
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);

      const token = extractToken(sendEmailSpy.mock.calls[0][0].text);
      const verifyRes = await request(app).post('/api/v1/auth/verify-email').send({ token });
      expect(verifyRes.status).toBe(200);

      // Single-use — a second attempt with the same token must fail.
      const reuseRes = await request(app).post('/api/v1/auth/verify-email').send({ token });
      expect(reuseRes.status).toBe(400);
    });

    it('rejects an invalid or unknown verification token with 400', async () => {
      if (skip) return;
      const res = await request(app).post('/api/v1/auth/verify-email').send({ token: 'not-a-real-token' });
      expect(res.status).toBe(400);
    });
  });
});
