import { Pool } from 'pg';
import { env } from './env';

/**
 * Single shared connection pool. Models/repositories import this and
 * issue parameterized queries only — never string-interpolated SQL.
 * The pool itself never touches req/res (see models/ layer rules).
 */
export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  ssl: env.db.ssl ? { rejectUnauthorized: false } : undefined,
  max: env.db.poolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  // Unexpected error on an idle client — log and let the process
  // supervisor decide whether to restart; never crash silently.
  // eslint-disable-next-line no-console
  console.error('Unexpected PostgreSQL pool error', err);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
