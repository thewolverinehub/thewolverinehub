import type { APIRoute } from 'astro';
import { cmsFailure, EMAIL_RE, fail, json, passwordProblem, rateLimited, readJson, safeNext, USERNAME_RE, clientIp } from '../../../lib/auth/http';
import { displayName, notifyWelcome, registerMember } from '../../../lib/auth/cms';
import { cookieOptions, createSessionValue, SESSION_COOKIE } from '../../../lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  if (rateLimited(`register:${clientIp(ctx)}`, 6, 60 * 60_000)) return fail(429, 'Too many sign-ups from this connection. Please try again later.');

  const b = await readJson(ctx.request);
  if (!b) return fail(400, 'Invalid request.');

  const fullName = String(b.fullName ?? '').trim();
  const username = String(b.username ?? '').trim();
  const email = String(b.email ?? '').trim().toLowerCase();
  const password = String(b.password ?? '');
  const phone = String(b.phone ?? '').trim();

  if (fullName.length < 2) return fail(422, 'Please enter your full name.', 'fullName');
  if (!USERNAME_RE.test(username)) return fail(422, 'Username must be 3–30 characters: letters, numbers, dots, dashes or underscores.', 'username');
  if (!EMAIL_RE.test(email)) return fail(422, 'Please enter a valid email address.', 'email');
  if (!/^[+\d][\d\s()-]{6,}$/.test(phone)) return fail(422, 'Please enter a valid phone number.', 'phone');
  const pw = passwordProblem(password);
  if (pw) return fail(422, pw, 'password');
  if (password !== String(b.passwordConfirm ?? '')) return fail(422, 'The two passwords do not match.', 'passwordConfirm');
  if (b.acceptTerms !== true) return fail(422, 'Please accept the Terms and Privacy Policy to continue.', 'acceptTerms');

  try {
    const member = await registerMember({
      username,
      email,
      password,
      profile: {
        fullName,
        phone,
        dateOfBirth: b.dateOfBirth || null,
        gender: b.gender || null,
        emergencyContactName: b.emergencyContactName,
        emergencyContactPhone: b.emergencyContactPhone,
        fitnessGoals: b.fitnessGoals,
        marketingOptIn: b.marketingOptIn === true,
      },
    });
    ctx.cookies.set(SESSION_COOKIE, createSessionValue(member.id, displayName(member)), cookieOptions(ctx.url.protocol === 'https:'));
    void notifyWelcome(member.id);
    return json({ ok: true, redirect: safeNext(b.next, '/account') });
  } catch (err: any) {
    if (err?.status === 400 && /taken|already/i.test(String(err?.message))) {
      return fail(409, 'That email or username is already registered. Try signing in instead.', 'email');
    }
    return cmsFailure(err, 'We could not create your account. Please try again.');
  }
};
