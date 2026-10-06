import type { APIRoute } from 'astro';
import { cmsFailure, fail, json, readJson } from '../../../lib/auth/http';
import { displayName, pickProfile, updateMember } from '../../../lib/auth/cms';
import { cookieOptions, createSessionValue, SESSION_COOKIE } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, cookies, url }) => {
  if (!locals.session) return fail(401, 'Please sign in.');
  const b = await readJson(request);
  if (!b) return fail(400, 'Invalid request.');

  const fullName = String(b.fullName ?? '').trim();
  if (fullName.length < 2) return fail(422, 'Please enter your full name.', 'fullName');
  const phone = String(b.phone ?? '').trim();
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) return fail(422, 'Please enter a valid phone number.', 'phone');

  try {
    const member = await updateMember(locals.session.uid, pickProfile({ ...b, fullName, phone, dateOfBirth: b.dateOfBirth || null, gender: b.gender || null }));
    cookies.set(SESSION_COOKIE, createSessionValue(member.id, displayName(member)), cookieOptions(url.protocol === 'https:'));
    return json({ ok: true });
  } catch (err) {
    return cmsFailure(err, 'We could not save your details. Please try again.');
  }
};
