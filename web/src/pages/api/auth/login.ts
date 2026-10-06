import type { APIRoute } from 'astro';
import { clientIp, fail, json, rateLimited, readJson, safeNext } from '../../../lib/auth/http';
import { CmsError, displayName, verifyLogin } from '../../../lib/auth/cms';
import { cookieOptions, createSessionValue, SESSION_COOKIE } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const b = await readJson(ctx.request);
  if (!b) return fail(400, 'Invalid request.');
  const identifier = String(b.identifier ?? '').trim();
  const password = String(b.password ?? '');
  if (!identifier || !password) return fail(422, 'Enter your email or username and your password.');

  // brute-force guard: per connection and per account
  if (rateLimited(`login-ip:${clientIp(ctx)}`, 20, 10 * 60_000) || rateLimited(`login-id:${identifier.toLowerCase()}`, 8, 10 * 60_000)) {
    return fail(429, 'Too many attempts. Please wait a few minutes and try again.');
  }

  try {
    const member = await verifyLogin(identifier, password);
    if (member.blocked) return fail(403, 'This account has been disabled. Please contact us.');
    ctx.cookies.set(SESSION_COOKIE, createSessionValue(member.id, displayName(member)), cookieOptions(ctx.url.protocol === 'https:'));
    return json({ ok: true, redirect: safeNext(b.next, '/account') });
  } catch (err) {
    if (err instanceof CmsError && (err.status === 400 || err.status === 401)) {
      return fail(401, 'Wrong email/username or password.');
    }
    console.error('[login]', err);
    return fail(502, 'We could not sign you in right now. Please try again.');
  }
};
