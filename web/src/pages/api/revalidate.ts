import type { APIRoute } from 'astro';
import { createHmac, timingSafeEqual } from 'crypto';
import { invalidateTag } from '../../lib/cache';

const SECRET = import.meta.env.REVALIDATE_SECRET;

// Map Strapi model UIDs to cache tag prefixes
const TAG_MAP: Record<string, string> = {
  'api::global.global': 'global',
  'api::header.header': 'header',
  'api::footer.footer': 'footer',
  'api::ui-strings.ui-strings': 'ui-strings',
  'api::class.class': 'class',
  'api::coach.coach': 'coach',
  'api::schedule-slot.schedule-slot': 'schedule-slots',
  'api::pricing-tier.pricing-tier': 'pricing-tiers',
  'api::pass.pass': 'passes',
  'api::testimonial.testimonial': 'testimonials',
  'api::faq.faq': 'faqs',
  'api::faq-category.faq-category': 'faq-categories',
  'api::gallery-item.gallery-item': 'gallery-items',
  'api::post.post': 'post',
  'api::redirect.redirect': 'redirects',
};

export const POST: APIRoute = async ({ request }) => {
  if (!SECRET) {
    return new Response('Revalidation not configured', { status: 503 });
  }

  // Verify HMAC signature from Strapi webhook
  const signature = request.headers.get('x-strapi-signature') ?? '';
  const body = await request.text();

  const expected = createHmac('sha256', SECRET).update(body).digest('hex');
  const expectedBuffer = Buffer.from(`sha256=${expected}`);
  const signatureBuffer = Buffer.from(signature);

  const validLength = expectedBuffer.length === signatureBuffer.length;
  const validSignature = validLength &&
    timingSafeEqual(expectedBuffer, signatureBuffer);

  if (!validSignature) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = JSON.parse(body) as { model?: string };
    const tag = payload.model ? (TAG_MAP[payload.model] ?? payload.model) : 'all';
    await invalidateTag(tag);

    return new Response(JSON.stringify({ revalidated: true, tag }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('Bad request', { status: 400 });
  }
};
