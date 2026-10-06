import type { Core } from '@strapi/strapi';
import { applyContentManagerLabels } from './bootstrap/cm-labels';
import { seedDefaultContent } from './bootstrap/seed';
import { runCatalogV2 } from './bootstrap/catalog-v2';

// Bump this string whenever you change seed data, schemas, labels or add a migration.
// Heavy bootstrap ops are skipped when the stored value matches — fast restarts.
const BOOTSTRAP_VERSION = '2026-10-07-v1';

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
  // pricing (legacy)
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

      // The legacy seeder only ever runs on a brand-new (empty) database. Existing databases are
      // owned by the CMS content + the one-time catalog migration below — the legacy seeder must
      // never re-create the old classes / programs / pricing packages.
      try {
        const hasContent = await (strapi.documents as any)('api::global.global').findFirst({});
        if (!hasContent) await seedDefaultContent(strapi);
      } catch (err) {
        strapi.log.warn('[bootstrap] Seed failed — create content manually in the admin.');
        strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
      }

      // "Pay per class" catalog (classes from the client's sheet, real coaches, Our Story…).
      try {
        const done = await bsStore.get({ key: 'catalog-v2' });
        if (!done) {
          const ok = await runCatalogV2(strapi);
          if (ok) await bsStore.set({ key: 'catalog-v2', value: new Date().toISOString() });
          else strapi.log.warn('[bootstrap] Catalog v2 had failing steps — it will retry on the next version bump.');
        }
      } catch (err) {
        strapi.log.error(`[bootstrap] Catalog v2 failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      try {
        await bsStore.set({ key: 'version', value: BOOTSTRAP_VERSION });
      } catch { /* non-fatal */ }
    }

    checkWebhookSecret(strapi);

    // ── Revalidation webhook (lightweight — always run) ───────────────────
    try {
      await ensureRevalidateWebhook(strapi);
    } catch (err) {
      strapi.log.warn('[bootstrap] Could not auto-create revalidation webhook — create it manually in Settings → Webhooks.');
      strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
    }
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

async function ensureRevalidateWebhook(strapi: Core.Strapi) {
  const siteUrl = process.env.PUBLIC_SITE_URL;
  const secret = process.env.WEBHOOK_SECRET;

  if (!siteUrl || !secret) {
    strapi.log.info('[bootstrap] Skipping revalidation webhook — PUBLIC_SITE_URL or WEBHOOK_SECRET not set');
    return;
  }

  const webhookUrl = `${siteUrl}/api/revalidate`;

  // strapi::webhook is Strapi v5's internal webhook entity
  const db = (strapi as any).db;
  const existing: Array<{ url: string }> = await db.query('strapi::webhook').findMany({});
  if (existing.some((w) => w.url === webhookUrl)) {
    strapi.log.info('[bootstrap] Revalidation webhook already registered');
    return;
  }

  // Strapi v5 has no built-in signing — pass the secret as a Bearer token in headers.
  // The Astro /api/revalidate endpoint verifies the Authorization header.
  await db.query('strapi::webhook').create({
    data: {
      name: 'Astro Revalidate',
      url: webhookUrl,
      headers: { Authorization: `Bearer ${secret}` },
      events: [
        'entry.create',
        'entry.update',
        'entry.delete',
        'entry.publish',
        'entry.unpublish',
        'media.create',
        'media.update',
        'media.delete',
      ],
      enabled: true,
    },
  });

  strapi.log.info(`[bootstrap] Created revalidation webhook → ${webhookUrl}`);
}
