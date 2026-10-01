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
  // Use the users-permissions plugin service API so Strapi's ORM manages the
  // junction table correctly — raw Knex inserts bypass the ORM and cause the
  // dedup check to fail on every restart.
  const plugin = (strapi as any).plugin('users-permissions');
  if (!plugin) {
    strapi.log.warn('[bootstrap] users-permissions plugin not found — skipping permission setup');
    return;
  }

  const roleService = plugin.service('role');

  const roles: Array<{ id: number; type: string }> = await roleService.find();
  const publicRole = roles.find((r) => r.type === 'public');
  if (!publicRole) {
    strapi.log.warn('[bootstrap] Public role not found — skipping permission setup');
    return;
  }

  // findOne returns the role with a full permission TREE:
  // { "api::global": { controllers: { global: { find: { enabled, policy } } } } }
  const roleWithPerms: any = await roleService.findOne(publicRole.id);
  const permissions: Record<string, any> = roleWithPerms.permissions ?? {};

  // Debug: log what top-level keys the permission tree contains
  const treeKeys = Object.keys(permissions);
  strapi.log.info(`[bootstrap] Permission tree top-level keys (${treeKeys.length}): ${treeKeys.slice(0, 10).join(', ')}`);
  const apiKeys = treeKeys.filter(k => k.startsWith('api::'));
  strapi.log.info(`[bootstrap] API keys in tree: ${apiKeys.length > 0 ? apiKeys.join(', ') : '(none)'}`);

  // Helper: parse 'api::global.global' → apiKey='api::global', controller='global'
  const enable = (uid: string, actions: string[]) => {
    const colonIdx = uid.indexOf('::');
    const rest     = uid.slice(colonIdx + 2); // 'global.global'
    const dotIdx   = rest.indexOf('.');
    const apiKey   = `api::${rest.slice(0, dotIdx)}`;       // 'api::global'
    const ctrl     = rest.slice(dotIdx + 1);                // 'global'

    for (const action of actions) {
      const entry = permissions?.[apiKey]?.controllers?.[ctrl]?.[action];
      if (entry && !entry.enabled) {
        entry.enabled = true;
        changed++;
      }
    }
  };

  let changed = 0;
  for (const uid of PUBLIC_READ)        enable(uid, ['find', 'findOne']);
  for (const uid of PUBLIC_CREATE_ONLY) enable(uid, ['create']);

  if (changed === 0) {
    strapi.log.info('[bootstrap] Public permissions already up to date');
    return;
  }

  await roleService.updateRole(publicRole.id, { permissions });
  strapi.log.info(`[bootstrap] Enabled ${changed} public permissions`);
}

function checkWebhookSecret(strapi: Core.Strapi) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret || secret.length < 32) {
    strapi.log.warn('[bootstrap] WEBHOOK_SECRET is missing or too short. Set it before going live.');
  }
}
