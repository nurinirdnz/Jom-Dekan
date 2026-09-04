/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../src/config/config/db';

async function main(): Promise<void> {
  const seedPath = join(__dirname, '..', '..', 'database', 'seed.sql');
  const sql = readFileSync(seedPath, 'utf-8');
  await pool.query(sql);
  console.log('Seed data applied.');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
