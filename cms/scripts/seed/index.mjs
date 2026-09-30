/**
 * Idempotent dummy seed script.
 * Creates realistic fictional content for local development.
 * Run: npm run seed (from cms/)
 *
 * Uses a manifest.json to track created documentIds so seed:clear can remove
 * everything cleanly without touching real content.
 *
 * TODO (Phase 4 completion): implement full seed data as per spec §13.6
 * - 12 classes across 6 disciplines
 * - 5 coaches with bios
 * - ~40 weekly schedule slots
 * - 3 pricing tiers × 8 durations priced in LKR
 * - add-ons, token packs
 * - 3 programs
 * - 12 testimonials
 * - 20 FAQs in 4 categories
 * - 6 journal posts
 * - 30 gallery items
 * - amenities, stats, partners
 * - full header/footer/menu
 * - SEO on every entry
 * - legal pages with placeholder text
 */

import { createStrapi } from '@strapi/strapi';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

async function main() {
  console.log('🦡 Starting seed...');

  const strapi = await createStrapi({ appDir: path.join(__dirname, '../../') }).load();

  const manifest = fs.existsSync(MANIFEST_PATH)
    ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'))
    : { createdAt: new Date().toISOString(), entries: {} };

  // ── Global ──────────────────────────────────────────────────────────────────
  if (!manifest.entries.global) {
    const global = await strapi.documents('api::global.global').create({
      data: {
        siteName: 'The Wolverine Hub',
        siteTagline: 'Where Iron Meets Instinct.',
        email: 'train@thewolverinehub.com',
        phone: '+94 77 000 0000',
        whatsapp: '+94770000000',
        address: '123 Fitness Lane, Colombo 05, Sri Lanka',
        mapLink: 'https://maps.google.com',
        hoursJson: {
          monday: '06:00–21:00',
          tuesday: '06:00–21:00',
          wednesday: '06:00–21:00',
          thursday: '06:00–21:00',
          friday: '06:00–21:00',
          saturday: '07:00–19:00',
          sunday: '07:00–17:00',
        },
        instagram: 'https://instagram.com/thewolverinehub',
        facebook: 'https://facebook.com/thewolverinehub',
        companyNumber: 'PV 00000001',
        twitterHandle: '@wolverinehub',
        defaultSeo: {
          metaTitle: 'The Wolverine Hub — Where Iron Meets Instinct',
          metaDescription: 'Premium gym and training centre in Colombo, Sri Lanka. Classes, coaching and programs built for those who mean it.',
        },
      },
      status: 'published',
    });
    manifest.entries.global = global.documentId;
    console.log('✓ global');
  }

  // ── Disciplines ─────────────────────────────────────────────────────────────
  const disciplineNames = ['Boxing', 'HIIT', 'Strength', 'Muay Thai', 'Calisthenics', 'Jiujitsu'];
  manifest.entries.disciplines = manifest.entries.disciplines || [];

  for (const name of disciplineNames) {
    if (!manifest.entries.disciplines.find((d) => d.name === name)) {
      const d = await strapi.documents('api::discipline.discipline').create({
        data: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
      });
      manifest.entries.disciplines.push({ name, documentId: d.documentId });
      console.log(`✓ discipline: ${name}`);
    }
  }

  // Save manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log('📋 Manifest saved to', MANIFEST_PATH);

  await strapi.destroy();
  console.log('✅ Seed complete. Run npm run seed:clear to remove dummy data.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
