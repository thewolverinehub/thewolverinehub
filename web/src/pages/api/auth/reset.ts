import type { APIRoute } from 'astro';
import { cmsFailure, fail, json, passwordProblem, readJson } from '../../../lib/auth/http';
import { getMember, updateMember } from '../../../lib/auth/cms';
import { readResetToken } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const b = await readJson(request);
  const token = String(b?.token ?? '');
  const password = String(b?.password ?? '');
  const parsed = readResetToken(token);
  if (!parsed) return fail(400, 'This reset link is invalid or has expired. Please request a new one.', undefined, 'bad-token');

  const problem = passwordProblem(password);
  if (problem) return fail(422, problem, 'password');
  if (password !== String(b?.passwordConfirm ?? '')) return fail(422, 'The two passwords do not match.', 'passwordConfirm');

  try {
    const member = await getMember(parsed.uid);
    // The link only works once: any change to the account after it was issued invalidates it.
    if (!member || String((member as any).updatedAt ?? '') !== parsed.ps) {
      return fail(400, 'This reset link has already been used or has expired. Please request a new one.', undefined, 'bad-token');
    }
    await updateMember(member.id, { password });
    return json({ ok: true, redirect: '/login?reset=1' });
  } catch (err) {
    return cmsFailure(err, 'We could not reset your password. Please try again.');
  }
};
