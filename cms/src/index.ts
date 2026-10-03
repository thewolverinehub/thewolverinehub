import type { Core } from '@strapi/strapi';
import { applyContentManagerLabels } from './bootstrap/cm-labels';
import { seedDefaultContent } from './bootstrap/seed';

// Bump this string whenever you change seed data, schemas, or labels.
// Heavy bootstrap ops are skipped when the stored value matches — fast restarts.
const BOOTSTRAP_VERSION = '2025-10-03-v3';

// ---------------------------------------------------------------------------
// Public read-only content types — Public role gets find + findOne on these.
// ---------------------------------------------------------------------------
const PUBLIC_READ = [
  // single types
  'api::global.global',
  'api::header.header',
  'api::footer.footer',
  'api::ui-strings.ui-strings',
  // pages collection
  'api::page.page',
  'api::legal-page.legal-page',
  // classes & schedule
  'api::class.class',
  'api::discipline.discipline',
  'api::schedule-slot.schedule-slot',
  // coaches
  'api::coach.coach',
  // programs & pricing
  'api::program.program',
  'api::pricing-tier.pricing-tier',
  'api::pass.pass',
  'api::add-on.add-on',
  'api::token-pack.token-pack',
  // content
  'api::testimonial.testimonial',
  'api::faq.faq',
  'api::faq-category.faq-category',
  'api::gallery-item.gallery-item',
  'api::post.post',
  'api::post-category.post-category',
  'api::author.author',
  // misc
  'api::amenity.amenity',
  'api::partner.partner',
  'api::redirect.redirect',
  'api::stat.stat',
];

// Write-only — Public role gets create only (form submissions).
const PUBLIC_CREATE_ONLY = [
  'api::lead.lead',
  'api::newsletter-subscriber.newsletter-subscriber',
];

// ---------------------------------------------------------------------------
export default {
  register(_ctx: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ── Permissions (lightweight — always run) ────────────────────────────
    try {
      await setPublicPermissions(strapi);
    } catch (err) {
      strapi.log.warn('[bootstrap] Could not auto-configure public permissions — set them manually in Settings → Roles → Public.');
      strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
    }

    // ── Version-gated heavy ops (labels + seed) ───────────────────────────
    // Skip when the stored version matches — saves 80+ remote DB round trips
    // on every restart. Bump BOOTSTRAP_VERSION above when making schema/seed changes.
    const bsStore = (strapi as any).store({ type: 'plugin', name: 'wolverine-bootstrap' });
    let storedVersion: string | null = null;
    try { storedVersion = await bsStore.get({ key: 'version' }); } catch { /* first run */ }

    if (storedVersion === BOOTSTRAP_VERSION) {
      strapi.log.info(`[bootstrap] Version ${BOOTSTRAP_VERSION} already applied — skipping heavy ops`);
    } else {
      strapi.log.info(`[bootstrap] Version changed (${storedVersion ?? 'none'} → ${BOOTSTRAP_VERSION}) — running full bootstrap`);

      try {
        await applyContentManagerLabels(strapi);
      } catch (err) {
        strapi.log.warn('[bootstrap] Could not apply content-manager labels.');
        strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        await seedDefaultContent(strapi);
      } catch (err) {
        strapi.log.warn('[bootstrap] Seed failed — create content manually in the admin.');
        strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        await bsStore.set({ key: 'version', value: BOOTSTRAP_VERSION });
      } catch { /* non-fatal */ }
    }

    checkWebhookSecret(strapi);
  },
};

// ---------------------------------------------------------------------------
async function setPublicPermissions(strapi: Core.Strapi) {
  // In Strapi v5 the users-permissions roleService.findOne() only returns
  // plugin-level actions in its permission tree — never api:: actions.
  // We create api:: permissions directly via strapi.db.query so they land in
  // up_permissions and up_permissions_role_lnk through the ORM.
  const db = (strapi as any).db;

  const publicRole = await db.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });
  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission setup');
    return;
  }

  // Build the full set of action strings we want enabled.
  const desired: string[] = [];
  for (const uid of PUBLIC_READ) {
    desired.push(`${uid}.find`, `${uid}.findOne`);
  }
  for (const uid of PUBLIC_CREATE_ONLY) {
    desired.push(`${uid}.create`);
  }

  // Find which actions already exist in DB for the public role.
  const existing: Array<{ action: string }> = await db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: { id: publicRole.id } } });
  const existingSet = new Set(existing.map((p: { action: string }) => p.action));

  const missing = desired.filter((a) => !existingSet.has(a));

  if (missing.length === 0) {
    strapi.log.info('[bootstrap] Public permissions already up to date');
    return;
  }

  for (const action of missing) {
    await db.query('plugin::users-permissions.permission').create({
      data: { action, role: publicRole.id },
    });
  }

  strapi.log.info(`[bootstrap] Created ${missing.length} public API permissions`);
}

function checkWebhookSecret(strapi: Core.Strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    strapi.log.warn('[bootstrap] WEBHOOK_SECRET is missing or too short. Set it before going live.');
  }
}
