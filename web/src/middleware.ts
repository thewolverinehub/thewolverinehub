import { defineMiddleware } from 'astro:middleware';

const SITE_INDEXING = import.meta.env.SITE_INDEXING === 'true';
const EDGE_CHECK = import.meta.env.EDGE_CHECK === 'true';
const EDGE_SECRET = import.meta.env.TWH_EDGE_SECRET;

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url } = context;

  // ── 1. Origin check (Cloudflare edge — enabled at go-live) ────────────────
  if (EDGE_CHECK && EDGE_SECRET) {
    const edgeHeader = request.headers.get('x-twh-edge');
    if (edgeHeader !== EDGE_SECRET) {
      return new Response('Forbidden', { status: 403 });
    }
  }

  // ── 2. Redirects from Strapi ───────────────────────────────────────────────
  // Lightweight redirect check — only runs if we have redirects cached
  try {
    const { getRedirects } = await import('./lib/strapi/queries');
    const redirectsRes = await getRedirects();
    const match = redirectsRes.find((r) => r.from === url.pathname);
    if (match) {
      const status = match.statusCode === 'permanent' ? 301 : 302;
      return Response.redirect(new URL(match.to, url.origin), status);
    }
  } catch {
    // If redirects fail to load, continue without them
  }

  // ── 3. Generate response ──────────────────────────────────────────────────
  const response = await next();

  // ── 4. Security headers ───────────────────────────────────────────────────
  const headers = new Headers(response.headers);

  // Noindex on all responses when site indexing is disabled
  if (!SITE_INDEXING) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // HSTS — only set on HTTPS (Railway handles this; skip on localhost)
  if (url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // CSP — strict baseline; tightened at go-live with Cloudflare nonces
  const CMS_PUBLIC_URL = import.meta.env.CMS_PUBLIC_URL || 'http://localhost:1337';
  const BUCKET_ENDPOINT = import.meta.env.BUCKET_ENDPOINT || 'http://localhost:9000';

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'`, // tightened with nonces in Phase 14
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: ${CMS_PUBLIC_URL} ${BUCKET_ENDPOINT} https://t3.storageapi.dev`,
    `media-src 'self' blob: ${CMS_PUBLIC_URL} ${BUCKET_ENDPOINT} https://t3.storageapi.dev`,
    `font-src 'self'`,
    `connect-src 'self' ${CMS_PUBLIC_URL}`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join('; ');

  headers.set('Content-Security-Policy', csp);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
