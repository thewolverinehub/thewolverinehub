import { factories } from '@strapi/strapi';
import {
  BookingError, availability, cancelBooking, listForUser, reserve, sendDayBeforeReminders,
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
  /** POST /api/bookings/reserve  { userId, slotId, date } */
  async reserve(ctx) {
    await run(ctx, async () => {
      const { slotId, date } = ctx.request.body ?? {};
      if (!slotId || !date) throw new BookingError(400, 'Choose a session and a date.', 'bad-request');
      const { booking, payment, resumed } = await reserve(strapi, { userId: userIdOf(ctx), slotDocumentId: String(slotId), date: String(date) });
      return { booking, payment, resumed };
    });
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
