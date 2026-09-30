/**
 * Removes all dummy seed data using the documentIds stored in manifest.json.
 * Does NOT touch entries that were not created by the seed script.
 * Run: npm run seed:clear (from cms/)
 */

import { createStrapi } from '@strapi/strapi';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

async function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('No manifest.json found — nothing to clear.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  console.log('🗑️  Clearing seed data from manifest...');

  const strapi = await createStrapi({ appDir: path.join(__dirname, '../../') }).load();

  // Clear disciplines
  if (Array.isArray(manifest.entries.disciplines)) {
    for (const d of manifest.entries.disciplines) {
      await strapi.documents('api::discipline.discipline').delete({ documentId: d.documentId }).catch(() => {});
      console.log(`✓ deleted discipline: ${d.name}`);
    }
  }

  // Clear global (reset to defaults)
  if (manifest.entries.global) {
    await strapi.documents('api::global.global').delete({ documentId: manifest.entries.global }).catch(() => {});
    console.log('✓ deleted global');
  }

  fs.unlinkSync(MANIFEST_PATH);
  console.log('✅ Seed data cleared. manifest.json removed.');

  await strapi.destroy();
}

main().catch((err) => {
  console.error('Clear failed:', err);
  process.exit(1);
});
