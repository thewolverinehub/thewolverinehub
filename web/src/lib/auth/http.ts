import type { APIContext } from 'astro';
import { CmsError } from './cms';

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', ...headers },
  });

export const fail = (status: number, message: string, field?: string, code?: string) =>
  json({ ok: false, message, ...(field ? { field } : {}), ...(code ? { code } : {}) }, status);

export async function readJson(request: Request): Promise<Record<string, any> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, any>) : null;
  } catch {
    return null;
  }
}

/** Maps a CMS error to something safe to show a visitor. */
export function cmsFailure(err: unknown, fallback = 'Something went wrong. Please try again.') {
  if (err instanceof CmsError) {
    const status = err.status >= 400 && err.status < 500 ? err.status : 502;
    return fail(status, status === 502 ? fallback : err.message, undefined, err.code);
  }
  console.error('[api]', err);
  return fail(500, fallback);
}

// ── Rate limiting (in-memory; per server instance) ───────────────────────────
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return list.length > max;
}

export const clientIp = (ctx: Pick<APIContext, 'request' | 'clientAddress'>) => {
  try {
    return ctx.request.headers.get('x-forwarded-for')?.split(',')[0].trim() || ctx.clientAddress || 'unknown';
  } catch {
    return 'unknown';
  }
};

// ── Validation ───────────────────────────────────────────────────────────────
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password needs at least one letter and one number.';
  if (pw.length > 100) return 'Password is too long.';
  return null;
}

/** Only allow same-site relative redirects after login. */
export const safeNext = (next: unknown, fallback = '/account') =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
