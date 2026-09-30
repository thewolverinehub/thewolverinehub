import type { Core } from '@strapi/strapi';

// Public read-only content types — Public role gets find/findOne on these.
const PUBLIC_READ = [
  'api::global.global',
  'api::header.header',
  'api::footer.footer',
  'api::ui-strings.ui-strings',
  'api::home-page.home-page',
  'api::classes-page.classes-page',
  'api::schedule-page.schedule-page',
  'api::programs-page.programs-page',
  'api::pricing-page.pricing-page',
  'api::coaches-page.coaches-page',
  'api::gallery-page.gallery-page',
  'api::journal-page.journal-page',
  'api::testimonials-page.testimonials-page',
  'api::faq-page.faq-page',
  'api::contact-page.contact-page',
  'api::not-found-page.not-found-page',
  'api::error-page.error-page',
  'api::page.page',
  'api::legal-page.legal-page',
  'api::class.class',
  'api::discipline.discipline',
  'api::schedule-slot.schedule-slot',
  'api::coach.coach',
  'api::program.program',
  'api::pricing-tier.pricing-tier',
  'api::pass.pass',
  'api::add-on.add-on',
  'api::token-pack.token-pack',
  'api::testimonial.testimonial',
  'api::faq.faq',
  'api::faq-category.faq-category',
  'api::gallery-item.gallery-item',
  'api::post.post',
  'api::post-category.post-category',
  'api::author.author',
  'api::amenity.amenity',
  'api::stat.stat',
  'api::partner.partner',
  'api::redirect.redirect',
];

// Write-only types — Public role gets create only.
const PUBLIC_CREATE_ONLY = [
  'api::lead.lead',
  'api::newsletter-subscriber.newsletter-subscriber',
];

export default {
  register(_ctx: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await setPublicPermissions(strapi);
    } catch (err) {
      strapi.log.warn('[bootstrap] Could not auto-configure public permissions — set them manually in the admin panel.');
      strapi.log.warn(`[bootstrap] Reason: ${err instanceof Error ? err.message : String(err)}`);
    }

    checkWebhookSecret(strapi);
  },
};

async function setPublicPermissions(strapi: Core.Strapi) {
  // Get the Public role
  const roles = await strapi.db
    .query('plugin::users-permissions.role')
    .findMany({ where: { type: 'public' } });

  const publicRole = roles[0];
  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission setup');
    return;
  }

  // Get existing permissions for this role using db.query (avoids relation filter issues)
  const existing = await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: { id: publicRole.id } } });

  const existingActions = new Set(existing.map((p: { action: string }) => p.action));

  // Build desired permissions list
  const desired: string[] = [];
  for (const uid of PUBLIC_READ) {
    desired.push(`${uid}.find`, `${uid}.findOne`);
  }
  for (const uid of PUBLIC_CREATE_ONLY) {
    desired.push(`${uid}.create`);
  }

  // Create only the missing ones
  const missing = desired.filter((action) => !existingActions.has(action));

  if (missing.length === 0) {
    strapi.log.info('[bootstrap] Public permissions already up to date');
    return;
  }

  await Promise.all(
    missing.map((action) =>
      strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: publicRole.id, enabled: true },
      })
    )
  );

  strapi.log.info(`[bootstrap] Created ${missing.length} public permissions`);
}

function checkWebhookSecret(strapi: Core.Strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    strapi.log.warn('[bootstrap] WEBHOOK_SECRET is missing or too short. Set it before going live.');
  }
}
