/**
 * Member sessions.
 *
 * The website owns the login session: after Strapi verifies the password we issue our own signed,
 * HttpOnly cookie ({ uid, name, exp }). The browser never sees a Strapi JWT, and the cookie can't be
 * read or forged by scripts. Signing key: SESSION_SECRET (falls back to a key derived from the
 * server-only API token, so nothing extra is needed to get started).
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'twh_session';
export const SESSION_DAYS = 14;

export interface SessionPayload {
  /** Strapi user id */
  uid: number;
  /** display name for the header (full name or username) */
  name: string;
  /** expiry, unix seconds */
  exp: number;
}

function secret(): string {
  const explicit = import.meta.env.SESSION_SECRET || process.env.SESSION_SECRET;
  if (explicit) return explicit;
  const token = import.meta.env.STRAPI_API_TOKEN || process.env.STRAPI_API_TOKEN || 'dev-only-insecure-secret';
  return createHash('sha256').update(`twh-session:${token}`).digest('hex');
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');
const sign = (data: string) => createHmac('sha256', secret()).update(data).digest('base64url');

export function createSessionValue(uid: number, name: string, days = SESSION_DAYS): string {
  const payload: SessionPayload = { uid, name, exp: Math.floor(Date.now() / 1000) + days * 86400 };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function readSessionValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;
  const [body, sig] = value.split('.');
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.uid || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Short-lived signed token for password reset links (1 hour). */
export function createResetToken(uid: number, passwordStamp: string): string {
  const body = b64(JSON.stringify({ uid, ps: passwordStamp, exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `${body}.${sign('reset:' + body)}`;
}

export function readResetToken(token: string): { uid: number; ps: string } | null {
  const [body, sig] = (token || '').split('.');
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign('reset:' + body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!p.uid || p.exp < Date.now() / 1000) return null;
    return { uid: p.uid, ps: p.ps };
  } catch {
    return null;
  }
}

export function cookieOptions(isHttps: boolean, days = SESSION_DAYS) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isHttps,
    path: '/',
    maxAge: days * 86400,
  };
}
