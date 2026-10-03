import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'crypto';
import { invalidateTag } from '../../lib/cache';

const SECRET = import.meta.env.REVALIDATE_SECRET;

// Map Strapi model UIDs to cache tag prefixes
// Keys are Strapi v5 UIDs (uid field in payload) — values are Redis tag prefixes
const TAG_MAP: Record<string, string> = {
  'api::global.global': 'global',
  'api::header.header': 'header',
  'api::footer.footer': 'footer',
  'api::ui-strings.ui-strings': 'ui-strings',
  'api::page.page': 'page',
  'api::legal-page.legal-page': 'legal-page',
  'api::class.class': 'class',
  'api::discipline.discipline': 'discipline',
  'api::coach.coach': 'coach',
  'api::schedule-slot.schedule-slot': 'schedule-slots',
  'api::program.program': 'program',
  'api::pricing-tier.pricing-tier': 'pricing-tiers',
  'api::pass.pass': 'passes',
  'api::add-on.add-on': 'add-on',
  'api::token-pack.token-pack': 'token-pack',
  'api::testimonial.testimonial': 'testimonials',
  'api::faq.faq': 'faqs',
  'api::faq-category.faq-category': 'faq-categories',
  'api::gallery-item.gallery-item': 'gallery-items',
  'api::post.post': 'post',
  'api::post-category.post-category': 'post-category',
  'api::author.author': 'author',
  'api::redirect.redirect': 'redirects',
  'api::amenity.amenity': 'amenity',
  'api::partner.partner': 'partner',
  'api::stat.stat': 'stat',
};

export const POST: APIRoute = async ({ request }) => {
  if (!SECRET) {
    return new Response('Revalidation not configured', { status: 503 });
  }

  // Strapi v5 does not sign webhooks — we pass WEBHOOK_SECRET as a Bearer token
  // via the webhook's custom headers config so we can verify the caller.
  const authHeader = request.headers.get('authorization') ?? '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  const expectedBuf = Buffer.from(SECRET);
  const receivedBuf = Buffer.from(bearer);
  const validAuth =
    expectedBuf.length === receivedBuf.length &&
    timingSafeEqual(expectedBuf, receivedBuf);

  if (!validAuth) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = await request.text();

  try {
    // Strapi v5 payload: { event, uid, model, entry, ... }
    // uid is the full API UID (e.g. "api::page.page"); model is the short name ("page")
    const payload = JSON.parse(body) as { uid?: string; model?: string };
    const lookup = payload.uid ?? payload.model ?? '';
    const tag = lookup ? (TAG_MAP[lookup] ?? payload.model ?? lookup) : 'all';
    await invalidateTag(tag);

    return new Response(JSON.stringify({ revalidated: true, tag }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Bad request', { status: 400 });
  }
};
