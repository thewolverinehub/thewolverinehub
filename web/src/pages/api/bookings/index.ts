import type { APIRoute } from 'astro';
import { cmsFailure, fail, json, rateLimited, readJson } from '../../../lib/auth/http';
import { reserveItems } from '../../../lib/auth/cms';

export const prerender = false;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST { items: [{ slotId, date }] }  (or the single { slotId, date })
 * Reserves every session in ONE order. Paid orders continue to /checkout; free ones are confirmed instantly.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session) return fail(401, 'Please sign in to book.', undefined, 'auth');
  if (rateLimited(`book:${locals.session.uid}`, 20, 10 * 60_000)) return fail(429, 'Too many booking attempts. Please slow down.');

  const b = await readJson(request);
  const raw: { slotId?: unknown; date?: unknown }[] = Array.isArray(b?.items) ? b!.items : [{ slotId: b?.slotId, date: b?.date }];
  const items = raw.map((i) => ({ slotId: String(i?.slotId ?? ''), date: String(i?.date ?? '') })).filter((i) => i.slotId && DATE.test(i.date));
  if (items.length === 0) return fail(422, 'Choose a session and a date.');
  if (items.length > 12) return fail(422, 'You can book up to 12 sessions at once.');

  try {
    const { orderId, bookings, booking, payment, total } = await reserveItems(locals.session.uid, items);
    if (booking.status === 'confirmed' && total === 0) {
      return json({ ok: true, free: true, orderId, count: bookings.length, reference: booking.reference, redirect: `/account/bookings?booked=${encodeURIComponent(orderId)}&n=${bookings.length}` });
    }
    return json({ ok: true, free: false, orderId, count: bookings.length, reference: booking.reference, redirect: `/checkout/${encodeURIComponent(payment.orderId)}` });
  } catch (err) {
    return cmsFailure(err, 'We could not reserve those seats. Please try again.');
  }
};
