import type { Core } from '@strapi/strapi';
import { applyContentManagerLabels } from './bootstrap/cm-labels';
import { seedDefaultContent } from './bootstrap/seed';

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
    try {
      await setPublicPermissions(strapi);
    } catch (err) {
      strapi.log.warn('[bootstrap] Could not auto-configure public permissions — set them manually in Settings → Roles → Public.');
      strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
    }

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

    checkWebhookSecret(strapi);
  },
};

// ---------------------------------------------------------------------------
async function setPublicPermissions(strapi: Core.Strapi) {
  // Use the raw Knex connection — Strapi v5 stores role↔permission via a
  // junction table (up_permissions_role_lnk) that the ORM query builder
  // doesn't traverse correctly when filtering by role.
  const knex = (strapi.db as any).connection as import('knex').Knex;

  const [publicRole] = await knex('up_roles').where({ type: 'public' }).select('id');
  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission setup');
    return;
  }

  // Fetch existing actions linked to the public role via the junction table
  const existingPerms = await knex('up_permissions')
    .join('up_permissions_role_lnk', 'up_permissions.id', 'up_permissions_role_lnk.permission_id')
    .where('up_permissions_role_lnk.role_id', publicRole.id)
    .select('up_permissions.action');

  const existingActions = new Set(existingPerms.map((p: { action: string }) => p.action));

  const desired: string[] = [];
  for (const uid of PUBLIC_READ)       desired.push(`${uid}.find`, `${uid}.findOne`);
  for (const uid of PUBLIC_CREATE_ONLY) desired.push(`${uid}.create`);

  const missing = desired.filter((action) => !existingActions.has(action));

  if (missing.length === 0) {
    strapi.log.info('[bootstrap] Public permissions already up to date');
    return;
  }

  // Insert each missing permission then link it to the public role
  for (const action of missing) {
    const documentId = require('crypto').randomUUID();
    const now = new Date();
    const [perm] = await knex('up_permissions')
      .insert({ action, document_id: documentId, created_at: now, updated_at: now, published_at: now })
      .returning('id');
    await knex('up_permissions_role_lnk').insert({
      permission_id: perm.id ?? perm,
      role_id: publicRole.id,
      permission_ord: 1,
    });
  }

  strapi.log.info(`[bootstrap] Created ${missing.length} public permissions`);
}

function checkWebhookSecret(strapi: Core.Strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    strapi.log.warn('[bootstrap] WEBHOOK_SECRET is missing or too short. Set it before going live.');
  }
}
