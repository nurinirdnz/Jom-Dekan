/* eslint-disable no-console */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../src/config/config/db';

/**
 * Minimal, dependency-free migration runner: applies every
 * database/migrations/*.sql file in filename order inside a single
 * transaction each, tracked in a schema_migrations table so re-running
 * this script is a no-op for already-applied files.
 */
async function main(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const migrationsDir = join(__dirname, '..', '..', 'database', 'migrations');
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  const { rows: applied } = await pool.query<{ filename: string }>('SELECT filename FROM schema_migrations');
  const appliedSet = new Set(applied.map((r) => r.filename));

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`apply ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`FAILED ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log('Migrations up to date.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
