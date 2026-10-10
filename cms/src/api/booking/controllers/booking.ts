import { factories } from '@strapi/strapi';
import {
  BookingError, availability, cancelBooking, listForUser, receiptPdf, reserveMany, sendDayBeforeReminders,
} from '../../../utils/booking';

/** Maps BookingError → a clean JSON error response. */
async function run(ctx: any, fn: () => Promise<unknown>) {
  try {
    ctx.body = await fn();
  } catch (err: any) {
    if (err instanceof BookingError) {
      ctx.status = err.status;
      ctx.body = { error: { status: err.status, code: err.code, message: err.message } };
      return;
    }
    strapi.log.error(`[booking] ${err?.stack ?? err}`);
    ctx.status = 500;
    ctx.body = { error: { status: 500, code: 'server', message: 'Something went wrong. Please try again.' } };
  }
}

const userIdOf = (ctx: any): number => {
  const id = Number(ctx.request.body?.userId ?? ctx.query?.userId);
  if (!Number.isInteger(id) || id <= 0) throw new BookingError(400, 'Missing user.', 'no-user');
  return id;
};

export default factories.createCoreController('api::booking.booking', ({ strapi }) => ({
  /** POST /api/bookings/reserve  { userId, items: [{ slotId, date }] }  (or the single { slotId, date }) */
  async reserve(ctx) {
    await run(ctx, async () => {
      const body = ctx.request.body ?? {};
      const raw: { slotId?: string; date?: string }[] = Array.isArray(body.items) ? body.items : [{ slotId: body.slotId, date: body.date }];
      const items = raw.map((i) => ({ slotDocumentId: String(i?.slotId ?? ''), date: String(i?.date ?? '') })).filter((i) => i.slotDocumentId && i.date);
      if (items.length === 0) throw new BookingError(400, 'Choose a session and a date.', 'bad-request');
      const { orderId, bookings, booking, payment, total, resumed } = await reserveMany(strapi, { userId: userIdOf(ctx), items });
      return { orderId, bookings, booking, payment, total, resumed };
    });
  },

  /** GET /api/bookings/receipt?userId=&orderId=  → application/pdf */
  async receipt(ctx) {
    try {
      const orderId = String(ctx.query?.orderId ?? '');
      if (!orderId) throw new BookingError(400, 'Missing order.', 'bad-request');
      const pdf = await receiptPdf(strapi, orderId, userIdOf(ctx));
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `inline; filename="receipt-${orderId}.pdf"`);
      ctx.body = Buffer.from(pdf);
    } catch (err: any) {
      if (err instanceof BookingError) { ctx.status = err.status; ctx.body = { error: { status: err.status, code: err.code, message: err.message } }; return; }
      strapi.log.error(`[booking] receipt: ${err?.stack ?? err}`);
      ctx.status = 500;
      ctx.body = { error: { status: 500, code: 'server', message: 'Could not create the receipt.' } };
    }
  },

  /** POST /api/bookings/:documentId/cancel  { userId } */
  async cancel(ctx) {
    await run(ctx, async () => ({
      booking: await cancelBooking(strapi, { userId: userIdOf(ctx), bookingDocumentId: ctx.params.documentId }),
    }));
  },

  /** GET /api/bookings/mine?userId= */
  async mine(ctx) {
    await run(ctx, async () => listForUser(strapi, userIdOf(ctx)));
  },

  /** GET /api/bookings/messages?userId= → emails sent (or logged) to this member, newest first */
  async messages(ctx) {
    await run(ctx, async () => {
      const user = await (strapi.db as any).query('plugin::users-permissions.user').findOne({ where: { id: userIdOf(ctx) } });
      if (!user?.email) return { emails: [] };
      const rows: any[] = await (strapi.db as any).query('api::email-log.email-log').findMany({ where: { to: user.email }, orderBy: { createdAt: 'desc' }, limit: 50 });
      return { emails: rows.map((r) => ({ documentId: r.documentId, subject: r.subject, type: r.type, status: r.status, body: r.body, createdAt: r.createdAt })) };
    });
  },

  /** GET /api/bookings/availability?from=YYYY-MM-DD&to=YYYY-MM-DD → { "slotId|date": seatsTaken } */
  async availability(ctx) {
    await run(ctx, async () => {
      const { from, to } = ctx.query ?? {};
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(from)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(to))) {
        throw new BookingError(400, 'from and to must be YYYY-MM-DD.', 'bad-request');
      }
      return { taken: await availability(strapi, String(from), String(to)) };
    });
  },

  /** POST /api/bookings/run-reminders — manual trigger (same job the daily cron runs). */
  async runReminders(ctx) {
    await run(ctx, async () => sendDayBeforeReminders(strapi));
  },
}));
