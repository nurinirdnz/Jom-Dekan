// Provides safe, non-secret defaults so `npm test` works without a
// developer having to hand-craft a .env for CI/local test runs.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || 'http://localhost:5173';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_NAME = process.env.DB_NAME || 'jomdekan_test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret-that-is-at-least-32-chars';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret-that-is-at-least-32-chars';
process.env.COOKIE_SECRET = process.env.COOKIE_SECRET || 'test-cookie-secret';
process.env.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local-fs';
process.env.STORAGE_LOCAL_ROOT = process.env.STORAGE_LOCAL_ROOT || './storage/resources-test';
process.env.STORAGE_SIGNING_SECRET =
  process.env.STORAGE_SIGNING_SECRET || 'test-storage-signing-secret-that-is-at-least-32-chars';
// Force-safe regardless of a developer's local .env: tests must never send
// real email (EMAIL_PROVIDER=smtp there would attempt live SMTP delivery)
// and must not trip auth rate limiting just from running the suite once.
process.env.EMAIL_PROVIDER = 'console';
process.env.RATE_LIMIT_MAX_AUTH = process.env.RATE_LIMIT_MAX_AUTH || '1000';
