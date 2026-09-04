/* eslint-disable no-console */
import { userModel } from '../src/models/userModel';
import { pool } from '../src/config/config/db';

/**
 * Promotes an existing, already-registered user to ADMIN. Public
 * registration can never create an admin directly (see authValidators
 * .strict() schemas) — this script is the only path to the first admin
 * account, and it must be run from a trusted machine/CI job, never
 * exposed as an HTTP endpoint.
 *
 * Usage:
 *   npm --prefix backend run create-admin -- --email you@example.com
 */
async function main(): Promise<void> {
  const emailArgIndex = process.argv.indexOf('--email');
  const email = emailArgIndex !== -1 ? process.argv[emailArgIndex + 1] : undefined;

  if (!email) {
    console.error('Usage: npm run create-admin -- --email you@example.com');
    process.exit(1);
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    console.error(`No account found for ${email}. Register the account through the app first, then re-run this.`);
    process.exit(1);
  }

  await userModel.setRole(user.id, 'ADMIN');
  console.log(`${email} is now an ADMIN.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
