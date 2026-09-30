import type { Core } from '@strapi/strapi';

// Public read-only content types — the Public role gets find/findOne on these.
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

// Write-only types — Public role gets create only, never find/findOne.
const PUBLIC_CREATE_ONLY = [
  'api::lead.lead',
  'api::newsletter-subscriber.newsletter-subscriber',
];

export default {
  register(_ctx: { strapi: Core.Strapi }) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await setPublicPermissions(strapi);
    await checkWebhookSecret(strapi);
  },
};

async function setPublicPermissions(strapi: Core.Strapi) {
  // Find the Public role
  const publicRole = await strapi
    .service('plugin::users-permissions.role')
    .findOne({ type: 'public' });

  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission setup');
    return;
  }

  const permissionsToCreate: Array<{ action: string; role: number }> = [];

  // Build find + findOne permissions for public read types
  for (const uid of PUBLIC_READ) {
    const [, apiPart] = uid.split('::');
    const [apiName] = apiPart.split('.');

    for (const action of ['find', 'findOne']) {
      permissionsToCreate.push({
        action: `${uid}.${action}`,
        role: publicRole.id,
      });
    }
  }

  // Build create-only permissions for write-only types
  for (const uid of PUBLIC_CREATE_ONLY) {
    permissionsToCreate.push({
      action: `${uid}.create`,
      role: publicRole.id,
    });
  }

  // Get existing permissions for the public role
  const existingPermissions = await strapi
    .service('plugin::users-permissions.permission')
    .find({ filters: { role: publicRole.id } });

  const existingActions = new Set(
    existingPermissions.map((p: { action: string; role: number }) => `${p.action}|${p.role}`)
  );

  // Only create permissions that don't already exist
  const toCreate = permissionsToCreate.filter(
    (p) => !existingActions.has(`${p.action}|${p.role}`)
  );

  if (toCreate.length > 0) {
    await Promise.all(
      toCreate.map((p) =>
        strapi.service('plugin::users-permissions.permission').create({ data: p })
      )
    );
    strapi.log.info(`[bootstrap] Created ${toCreate.length} public permissions`);
  } else {
    strapi.log.info('[bootstrap] Public permissions already up to date');
  }
}

async function checkWebhookSecret(strapi: Core.Strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    strapi.log.warn('[bootstrap] WEBHOOK_SECRET is missing or too short (minimum 32 chars). Set it before going live.');
  }
}
