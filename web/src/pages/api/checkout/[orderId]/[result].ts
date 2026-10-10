import type { APIRoute } from 'astro';
import { cmsFailure, fail, json } from '../../../../lib/auth/http';
import { completePayment, failPayment, getPaymentByOrder } from '../../../../lib/auth/cms';

export const prerender = false;

/**
 * Preview checkout (no real money). POST /api/checkout/:orderId/success | failed | cancelled
 * Disabled automatically once PAYMENT_MODE is "live". The real PayHere gateway will replace this
 * with its own return + notify endpoints without changing the booking logic.
 */
export const POST: APIRoute = async ({ params, locals }) => {
  if (!locals.session) return fail(401, 'Please sign in.');
  if ((import.meta.env.PAYMENT_MODE ?? 'preview') === 'live') return fail(404, 'Not available.');

  const orderId = String(params.orderId);
  const result = String(params.result);
  if (!['success', 'failed', 'cancelled'].includes(result)) return fail(404, 'Not found.');

  try {
    // ownership check: the payment must belong to the signed-in member
    const { payment } = await getPaymentByOrder(orderId, locals.session.uid);
    if (payment.provider !== 'preview') return fail(400, 'This payment is not a preview payment.');

    if (result === 'success') {
      const done = await completePayment(orderId, `PREVIEW-${Date.now()}`);
      return json({ ok: true, redirect: `/account/bookings?booked=${encodeURIComponent(orderId)}&n=${done.bookings?.length ?? 1}` });
    }
    await failPayment(orderId, result === 'cancelled' ? 'cancelled' : 'failed');
    return json({ ok: true, redirect: `/account/bookings?payment=${result}` });
  } catch (err) {
    return cmsFailure(err, 'The payment could not be completed. Please try again.');
  }
};
