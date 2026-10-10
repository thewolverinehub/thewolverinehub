import { factories } from '@strapi/strapi';
import { BookingError, bookingsOfOrder, completePayment, failPayment } from '../../../utils/booking';

async function run(ctx: any, fn: () => Promise<unknown>) {
  try {
    ctx.body = await fn();
  } catch (err: any) {
    if (err instanceof BookingError) {
      ctx.status = err.status;
      ctx.body = { error: { status: err.status, code: err.code, message: err.message } };
      return;
    }
    strapi.log.error(`[payment] ${err?.stack ?? err}`);
    ctx.status = 500;
    ctx.body = { error: { status: 500, code: 'server', message: 'Something went wrong. Please try again.' } };
  }
}

export default factories.createCoreController('api::payment.payment', ({ strapi }) => ({
  /** GET /api/payments/by-order/:orderId?userId= — the checkout page loads this. */
  async byOrder(ctx) {
    await run(ctx, async () => {
      const userId = Number(ctx.query?.userId);
      const payment = await (strapi.db as any).query('api::payment.payment').findOne({
        where: { orderId: ctx.params.orderId },
        populate: ['booking', 'user'],
      });
      if (!payment || (userId && payment.user?.id !== userId)) throw new BookingError(404, 'Payment not found.', 'no-payment');
      const { user, ...rest } = payment;
      const bookings = await bookingsOfOrder(strapi, payment);
      return { payment: rest, bookings };
    });
  },

  /** POST /api/payments/:orderId/complete — preview checkout "success" (PayHere notify later). */
  async complete(ctx) {
    await run(ctx, async () => {
      const { providerReference, raw } = ctx.request.body ?? {};
      return completePayment(strapi, ctx.params.orderId, providerReference, raw);
    });
  },

  /** POST /api/payments/:orderId/fail  { status?: 'failed' | 'cancelled' } */
  async fail(ctx) {
    await run(ctx, async () => failPayment(strapi, ctx.params.orderId, ctx.request.body?.status === 'cancelled' ? 'cancelled' : 'failed'));
  },
}));
