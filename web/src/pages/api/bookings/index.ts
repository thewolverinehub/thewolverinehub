import type { APIRoute } from 'astro';
import { cmsFailure, fail, json, rateLimited, readJson } from '../../../lib/auth/http';
import { reserveBooking } from '../../../lib/auth/cms';

export const prerender = false;

/** POST { slotId, date } → reserves a seat; paid classes continue to /checkout, free ones are confirmed instantly. */
export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.session) return fail(401, 'Please sign in to book.', undefined, 'auth');
  if (rateLimited(`book:${locals.session.uid}`, 20, 10 * 60_000)) return fail(429, 'Too many booking attempts. Please slow down.');

  const b = await readJson(request);
  const slotId = String(b?.slotId ?? '');
  const date = String(b?.date ?? '');
  if (!slotId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(422, 'Choose a session and a date.');

  try {
    const { booking, payment } = await reserveBooking(locals.session.uid, slotId, date);
    if (booking.status === 'confirmed') {
      return json({ ok: true, free: true, reference: booking.reference, redirect: `/account/bookings?booked=${encodeURIComponent(booking.reference)}` });
    }
    return json({ ok: true, free: false, reference: booking.reference, redirect: `/checkout/${encodeURIComponent(payment.orderId)}` });
  } catch (err) {
    return cmsFailure(err, 'We could not reserve that seat. Please try again.');
  }
};
