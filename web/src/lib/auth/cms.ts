/**
 * Server-side calls to the CMS for accounts, bookings and payments.
 * Everything here runs on the website server with the private API token — never in the browser.
 */

const CMS_URL = () => import.meta.env.CMS_INTERNAL_URL || import.meta.env.CMS_PUBLIC_URL || 'http://localhost:1337';
const TOKEN = () => import.meta.env.STRAPI_API_TOKEN;

export class CmsError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export async function cms<T = any>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(`${CMS_URL()}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN() ? { Authorization: `Bearer ${TOKEN()}` } : {}),
      ...(rest.headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON */ }
  if (!res.ok) {
    const e = data?.error;
    throw new CmsError(res.status, e?.message ?? `CMS request failed (${res.status})`, e?.code ?? e?.name);
  }
  return data as T;
}

// ── Members ──────────────────────────────────────────────────────────────────

export interface Member {
  id: number;
  documentId?: string;
  username: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  fitnessGoals?: string | null;
  medicalNotes?: string | null;
  marketingOptIn?: boolean;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
}

const PROFILE_FIELDS = [
  'fullName', 'phone', 'dateOfBirth', 'gender', 'emergencyContactName', 'emergencyContactPhone',
  'fitnessGoals', 'medicalNotes', 'marketingOptIn',
] as const;

export function pickProfile(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of PROFILE_FIELDS) {
    if (input[k] === undefined) continue;
    const v = input[k];
    out[k] = typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : v;
  }
  return out;
}

export async function getMember(id: number): Promise<Member | null> {
  try {
    return await cms<Member>(`/api/users/${id}`);
  } catch (err) {
    if (err instanceof CmsError && (err.status === 404 || err.status === 403)) return null;
    throw err;
  }
}

export async function findMemberByEmail(email: string): Promise<Member | null> {
  const list = await cms<Member[]>(`/api/users?filters[email][$eqi]=${encodeURIComponent(email)}`);
  return list[0] ?? null;
}

export async function registerMember(input: { username: string; email: string; password: string; profile: Record<string, unknown> }): Promise<Member> {
  const res = await cms<{ user: Member }>('/api/auth/local/register', {
    method: 'POST',
    json: { username: input.username, email: input.email, password: input.password },
  });
  const profile = pickProfile(input.profile);
  if (Object.keys(profile).length) {
    await cms(`/api/users/${res.user.id}`, { method: 'PUT', json: profile });
  }
  return (await getMember(res.user.id)) ?? res.user;
}

/** Verifies identifier (email or username) + password with Strapi and returns the member. */
export async function verifyLogin(identifier: string, password: string): Promise<Member> {
  const res = await cms<{ user: Member }>('/api/auth/local', { method: 'POST', json: { identifier, password } });
  return (await getMember(res.user.id)) ?? res.user;
}

export async function updateMember(id: number, data: Record<string, unknown>): Promise<Member> {
  await cms(`/api/users/${id}`, { method: 'PUT', json: data });
  return (await getMember(id))!;
}

export const displayName = (m: Pick<Member, 'fullName' | 'username'>) => (m.fullName || m.username || 'Member').trim();

// ── Bookings & payments ──────────────────────────────────────────────────────

export interface Booking {
  id: number;
  documentId: string;
  reference: string;
  classDocumentId: string;
  classSlug: string | null;
  slotDocumentId: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classNameSnapshot: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'attended' | 'no-show';
  holdExpiresAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: number;
  documentId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: 'preview' | 'payhere' | 'free';
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  paidAt: string | null;
  createdAt: string;
  booking?: Booking | null;
}

export interface MemberEmail {
  documentId: string;
  subject: string;
  type: string;
  status: 'logged' | 'sent' | 'failed';
  body: string | null;
  createdAt: string;
}

/** Emails the system sent (or, until a provider is connected, logged) to this member. */
export const myEmails = (userId: number) => cms<{ emails: MemberEmail[] }>(`/api/bookings/messages?userId=${userId}`);

export const reserveBooking = (userId: number, slotId: string, date: string) =>
  cms<{ booking: Booking; payment: Payment; resumed: boolean }>('/api/bookings/reserve', { method: 'POST', json: { userId, slotId, date } });

export const myBookings = (userId: number) =>
  cms<{ bookings: Booking[]; payments: Payment[] }>(`/api/bookings/mine?userId=${userId}`);

export const cancelBooking = (userId: number, bookingDocumentId: string) =>
  cms<{ booking: Booking }>(`/api/bookings/${bookingDocumentId}/cancel`, { method: 'POST', json: { userId } });

export const getPaymentByOrder = (orderId: string, userId: number) =>
  cms<{ payment: Payment & { booking: Booking } }>(`/api/payments/by-order/${encodeURIComponent(orderId)}?userId=${userId}`);

export const completePayment = (orderId: string, providerReference?: string) =>
  cms<{ payment: Payment; booking: Booking }>(`/api/payments/${encodeURIComponent(orderId)}/complete`, { method: 'POST', json: { providerReference } });

export const failPayment = (orderId: string, status: 'failed' | 'cancelled' = 'failed') =>
  cms(`/api/payments/${encodeURIComponent(orderId)}/fail`, { method: 'POST', json: { status } });

/** Seats taken per "slotId|YYYY-MM-DD". */
export async function seatsTaken(from: string, to: string): Promise<Record<string, number>> {
  try {
    return (await cms<{ taken: Record<string, number> }>(`/api/bookings/availability?from=${from}&to=${to}`)).taken;
  } catch {
    return {}; // booking pages degrade to "spots unknown" if the CMS is unreachable
  }
}

export const notifyWelcome = (userId: number) => cms('/api/notify/welcome', { method: 'POST', json: { userId } }).catch(() => null);
export const notifyPasswordReset = (email: string, name: string, link: string) =>
  cms('/api/notify/password-reset', { method: 'POST', json: { email, name, link } }).catch(() => null);
