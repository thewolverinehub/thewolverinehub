import type { APIRoute } from 'astro';
import { clientIp, EMAIL_RE, fail, json, rateLimited, readJson } from '../../../lib/auth/http';
import { displayName, findMemberByEmail, notifyPasswordReset } from '../../../lib/auth/cms';
import { createResetToken } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const b = await readJson(ctx.request);
  const email = String(b?.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return fail(422, 'Please enter a valid email address.', 'email');
  if (rateLimited(`forgot:${clientIp(ctx)}`, 5, 60 * 60_000) || rateLimited(`forgot-id:${email}`, 3, 60 * 60_000)) {
    return fail(429, 'Too many requests. Please try again later.');
  }

  // Always answer the same way so the form can't be used to discover who has an account.
  try {
    const member = await findMemberByEmail(email);
    if (member && !member.blocked) {
      const origin = import.meta.env.PUBLIC_SITE_URL || ctx.url.origin;
      const link = `${origin.replace(/\/$/, '')}/reset-password?token=${createResetToken(member.id, String((member as any).updatedAt ?? ''))}`;
      await notifyPasswordReset(member.email, displayName(member), link);
    }
  } catch (err) {
    console.error('[forgot]', err);
  }
  return json({ ok: true, message: 'If that email has an account, a reset link is on its way.' });
};
