import type { APIRoute } from 'astro';
import { clientIp, cmsFailure, fail, json, passwordProblem, rateLimited, readJson } from '../../../lib/auth/http';
import { CmsError, getMember, updateMember, verifyLogin } from '../../../lib/auth/cms';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const { request, locals } = ctx;
  if (!locals.session) return fail(401, 'Please sign in.');
  if (rateLimited(`pw-change:${locals.session.uid}`, 6, 15 * 60_000) || rateLimited(`pw-change-ip:${clientIp(ctx)}`, 20, 15 * 60_000)) {
    return fail(429, 'Too many attempts. Please try again later.');
  }

  const b = await readJson(request);
  const current = String(b?.currentPassword ?? '');
  const next = String(b?.newPassword ?? '');
  const problem = passwordProblem(next);
  if (problem) return fail(422, problem, 'newPassword');
  if (next !== String(b?.newPasswordConfirm ?? '')) return fail(422, 'The two new passwords do not match.', 'newPasswordConfirm');

  try {
    const member = await getMember(locals.session.uid);
    if (!member) return fail(404, 'Account not found.');
    try {
      await verifyLogin(member.email, current);
    } catch (err) {
      if (err instanceof CmsError && (err.status === 400 || err.status === 401)) return fail(422, 'Your current password is not correct.', 'currentPassword');
      throw err;
    }
    await updateMember(member.id, { password: next });
    return json({ ok: true });
  } catch (err) {
    return cmsFailure(err, 'We could not change your password. Please try again.');
  }
};
