/**
 * Backup script for local or live database + media.
 *
 * Run:
 *   npm run backup:local  → backs up local Docker Postgres
 *   npm run backup:live   → dumps live Railway Postgres (requires DATABASE_URL_LIVE)
 */

import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUPS_DIR = path.join(__dirname, '../../../backups');

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

async function main() {
  const target = process.argv[2];
  if (!['local', 'live'].includes(target)) {
    console.error('Usage: node backup.mjs [local|live]');
    process.exit(1);
  }

  const ts = timestamp();
  const outDir = path.join(BACKUPS_DIR, `${target}-${ts}`);
  mkdirSync(outDir, { recursive: true });

  const dbUrl = target === 'live'
    ? process.env.DATABASE_URL_LIVE
    : `postgresql://${process.env.DATABASE_USERNAME ?? 'twh'}:${process.env.DATABASE_PASSWORD ?? 'twh_local_secret'}@localhost:5432/${process.env.DATABASE_NAME ?? 'wolverinehub'}`;

  if (!dbUrl) {
    console.error('❌ DATABASE_URL_LIVE not set in .env');
    process.exit(1);
  }

  const dumpFile = path.join(outDir, 'db.dump');
  console.log(`📦 Backing up ${target} database to ${dumpFile}...`);

  execSync(`pg_dump "${dbUrl}" -Fc -f "${dumpFile}"`, { stdio: 'inherit' });

  console.log(`✅ Backup saved to ${outDir}`);
}

main().catch((err) => {
  console.error('Backup failed:', err);
  process.exit(1);
});
