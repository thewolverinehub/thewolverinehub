import crypto from 'node:crypto';
import type { Core } from '@strapi/strapi';
import { addDays, bookingCutoffMinutes, colomboNow, toMinutes, weekdayOf } from './colombo';
import {
  bookingCancelledEmail,
  bookingReminderEmail,
  orderConfirmationEmail,
  sendEmail,
  type BookingMailData,
} from './email';
import { buildReceiptPdf, type ReceiptData } from './receipt';

/** A pending booking holds its seat this long while the member pays. */
export const HOLD_MINUTES = 15;
/** Members can book up to this many days ahead. */
export const BOOKING_WINDOW_DAYS = 30;
/** Self-service cancellation closes this many hours before the session starts. */
export const CANCEL_CUTOFF_HOURS = 12;

const BOOKING = 'api::booking.booking';
const PAYMENT = 'api::payment.payment';
const USER = 'plugin::users-permissions.user';

export class BookingError extends Error {
  constructor(public status: number, message: string, public code: string = 'error') {
    super(message);
  }
}

const dq = (strapi: Core.Strapi) => (strapi.db as any).query.bind(strapi.db) as (uid: string) => any;

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const code = (n: number) => Array.from({ length: n }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
export const newReference = () => `TWH-${code(6)}`;
export const newOrderId = () => `TWHO-${Date.now().toString(36).toUpperCase()}-${code(4)}`;

/** Wall-clock "now" as ISO for DB comparisons. */
const nowISO = () => new Date().toISOString();

/** The moment (UTC) a Colombo wall-clock date + minutes-since-midnight occurs. */
export function colomboInstant(dateISO: string, minutes: number): Date {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return new Date(`${dateISO}T${h}:${m}:00+05:30`);
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export async function getSlot(strapi: Core.Strapi, slotDocumentId: string) {
  const slot = await strapi.documents('api::schedule-slot.schedule-slot').findOne({
    documentId: slotDocumentId,
    status: 'published',
    populate: { class: { populate: ['coaches'] }, coach: true },
  } as any);
  return slot as any;
}

async function countTaken(strapi: Core.Strapi, slotDocumentId: string, dateISO: string): Promise<number> {
  return dq(strapi)(BOOKING).count({
    where: {
      slotDocumentId,
      sessionDate: dateISO,
      $or: [{ status: 'confirmed' }, { status: 'pending', holdExpiresAt: { $gt: nowISO() } }],
    },
  });
}

/** Seats taken per "slotDocumentId|date" for a date range (for the schedule + class pages). */
export async function availability(strapi: Core.Strapi, from: string, to: string): Promise<Record<string, number>> {
  const rows: any[] = await dq(strapi)(BOOKING).findMany({
    where: {
      sessionDate: { $gte: from, $lte: to },
      $or: [{ status: 'confirmed' }, { status: 'pending', holdExpiresAt: { $gt: nowISO() } }],
    },
    select: ['slotDocumentId', 'sessionDate'],
    limit: 5000,
  });
  const out: Record<string, number> = {};
  for (const r of rows) {
    const key = `${r.slotDocumentId}|${String(r.sessionDate).slice(0, 10)}`;
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

async function loadUser(strapi: Core.Strapi, userId: number) {
  const user = await dq(strapi)(USER).findOne({ where: { id: userId } });
  if (!user) throw new BookingError(404, 'Account not found.', 'no-user');
  return user;
}

const displayName = (u: any) => (u.fullName || u.username || 'there') as string;

async function mailData(strapi: Core.Strapi, booking: any): Promise<BookingMailData> {
  let userId = booking.userId ?? booking.user?.id;
  if (!userId && booking.id) {
    const full = await dq(strapi)(BOOKING).findOne({ where: { id: booking.id }, populate: ['user'] });
    userId = full?.user?.id;
  }
  const user = userId ? await dq(strapi)(USER).findOne({ where: { id: userId } }) : null;
  let room: string | undefined;
  let coachNames: string | undefined;
  try {
    const slot = await getSlot(strapi, booking.slotDocumentId);
    room = slot?.room || undefined;
    const coaches = slot?.coach ? [slot.coach] : slot?.class?.coaches ?? [];
    coachNames = coaches.map((c: any) => c.name).join(' & ') || undefined;
  } catch { /* the slot may have been deleted since — the email still goes out */ }
  return {
    name: displayName(user ?? {}),
    email: user?.email ?? '',
    reference: booking.reference,
    className: booking.classNameSnapshot,
    sessionDate: String(booking.sessionDate).slice(0, 10),
    startTime: booking.startTime,
    endTime: booking.endTime,
    amount: booking.amount ?? 0,
    room,
    coachNames,
  };
}

// ── Orders ──────────────────────────────────────────────────────────────────
// One order = one payment covering one or more session bookings (all carry the same orderId).

export const MAX_ORDER_ITEMS = 12;

/** All bookings that belong to a payment (legacy single bookings fall back to payment.booking). */
export async function bookingsOfOrder(strapi: Core.Strapi, payment: any): Promise<any[]> {
  const rows: any[] = await dq(strapi)(BOOKING).findMany({ where: { orderId: payment.orderId }, orderBy: [{ sessionDate: 'asc' }, { startTime: 'asc' }], limit: 100 });
  if (rows.length > 0) return rows;
  return payment.booking ? [payment.booking] : [];
}

interface OrderItemInput { slotDocumentId: string; date: string }

async function validateItem(strapi: Core.Strapi, item: OrderItemInput) {
  const { slotDocumentId, date } = item;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date))) throw new BookingError(400, 'Invalid date.', 'bad-date');
  const slot = await getSlot(strapi, slotDocumentId);
  if (!slot || slot.isActive === false || !slot.class) throw new BookingError(404, 'That session is not available.', 'no-slot');
  if (weekdayOf(date) !== slot.weekday) throw new BookingError(400, `${slot.class.name} does not run on that date.`, 'wrong-day');

  const now = colomboNow();
  if (date < now.dateISO) throw new BookingError(400, `${slot.class.name}: that date has already passed.`, 'past');
  if (date > addDays(now.dateISO, BOOKING_WINDOW_DAYS)) throw new BookingError(400, `You can book up to ${BOOKING_WINDOW_DAYS} days ahead.`, 'too-far');

  const startMin = toMinutes(slot.startTime);
  const endMin = toMinutes(slot.endTime);
  if (date === now.dateISO && now.minutes >= bookingCutoffMinutes(startMin, endMin)) {
    throw new BookingError(409, `Booking for ${slot.class.name} today has closed.`, 'closed');
  }
  const price = Number(slot.class.price ?? 0) || 0;
  const free = price === 0 || slot.class.isFree === true;
  return { slot, amount: free ? 0 : price };
}

export async function reserveMany(strapi: Core.Strapi, input: { userId: number; items: OrderItemInput[] }) {
  const { userId } = input;
  // de-duplicate
  const seen = new Set<string>();
  const items = input.items.filter((i) => { const k = `${i.slotDocumentId}|${i.date}`; if (seen.has(k)) return false; seen.add(k); return true; });
  if (items.length === 0) throw new BookingError(400, 'Choose at least one session.', 'empty');
  if (items.length > MAX_ORDER_ITEMS) throw new BookingError(400, `You can book up to ${MAX_ORDER_ITEMS} sessions at once.`, 'too-many');

  await loadUser(strapi, userId);
  const checked: { it: OrderItemInput; slot: any; amount: number }[] = [];
  for (const it of items) checked.push({ it, ...(await validateItem(strapi, it)) });
  const total = checked.reduce((n, c) => n + c.amount, 0);
  const free = total === 0;
  const orderId = newOrderId();

  const result = await strapi.db.transaction(async ({ trx }: any) => {
    // Serialise concurrent bookings of the same sessions (sorted → no deadlocks) so capacity can never be oversold.
    for (const key of [...seen].sort()) {
      try {
        const lock = BigInt('0x' + crypto.createHash('sha1').update(key).digest('hex').slice(0, 15));
        await trx.raw('select pg_advisory_xact_lock(?)', [lock.toString()]);
      } catch { /* non-postgres dev DB: best effort */ }
    }

    const created: any[] = [];
    for (const c of checked) {
      const { it, slot, amount } = c;
      // the member's own unfinished checkout for this session is simply replaced
      const mine: any[] = await dq(strapi)(BOOKING).findMany({ where: { slotDocumentId: it.slotDocumentId, sessionDate: it.date, user: userId, status: 'pending' } });
      for (const m of mine) await releasePending(strapi, m);

      const confirmed = await dq(strapi)(BOOKING).findOne({ where: { slotDocumentId: it.slotDocumentId, sessionDate: it.date, user: userId, status: 'confirmed' } });
      if (confirmed) throw new BookingError(409, `You are already booked into ${slot.class.name} on ${it.date}.`, 'duplicate');

      const taken = await countTaken(strapi, it.slotDocumentId, it.date);
      const capacity = Number(slot.capacity ?? 0);
      if (capacity > 0 && taken >= capacity) throw new BookingError(409, `Sorry — ${slot.class.name} on ${it.date} is full.`, 'full');

      created.push(await dq(strapi)(BOOKING).create({
        data: {
          reference: newReference(),
          orderId,
          user: userId,
          classDocumentId: slot.class.documentId,
          classSlug: slot.class.slug,
          slotDocumentId: it.slotDocumentId,
          sessionDate: it.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          classNameSnapshot: slot.class.name,
          amount,
          currency: 'LKR',
          status: free ? 'confirmed' : 'pending',
          holdExpiresAt: free ? null : new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
        },
      }));
    }

    const payment = await dq(strapi)(PAYMENT).create({
      data: {
        orderId,
        booking: created[0].id,
        user: userId,
        amount: total,
        currency: 'LKR',
        provider: free ? 'free' : (process.env.PAYMENT_MODE === 'payhere' ? 'payhere' : 'preview'),
        status: free ? 'paid' : 'pending',
        paidAt: free ? nowISO() : null,
      },
    });
    return { orderId, bookings: created, booking: created[0], payment, total, resumed: false };
  });

  if (free) await notifyOrderConfirmed(strapi, orderId);
  return result;
}

/** Single-session convenience wrapper (keeps the old API shape). */
export async function reserve(strapi: Core.Strapi, input: { userId: number; slotDocumentId: string; date: string }) {
  return reserveMany(strapi, { userId: input.userId, items: [{ slotDocumentId: input.slotDocumentId, date: input.date }] });
}

/** Cancel a member's unfinished (pending) booking and keep its order's payment consistent. */
async function releasePending(strapi: Core.Strapi, booking: any) {
  await dq(strapi)(BOOKING).update({ where: { id: booking.id }, data: { status: 'cancelled', cancelledAt: nowISO(), holdExpiresAt: null } });
  if (!booking.orderId) return;
  const pay = await dq(strapi)(PAYMENT).findOne({ where: { orderId: booking.orderId } });
  if (!pay || pay.status !== 'pending') return;
  const left: any[] = await dq(strapi)(BOOKING).findMany({ where: { orderId: booking.orderId, status: 'pending' } });
  if (left.length === 0) await dq(strapi)(PAYMENT).update({ where: { id: pay.id }, data: { status: 'cancelled' } });
  else await dq(strapi)(PAYMENT).update({ where: { id: pay.id }, data: { amount: left.reduce((n, b) => n + (b.amount ?? 0), 0) } });
}

// ── Payment results ─────────────────────────────────────────────────────────

/** Receipt payload for an order (PDF + email use the same data). */
export async function receiptData(strapi: Core.Strapi, orderId: string, userId?: number): Promise<ReceiptData> {
  const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking', 'user'] });
  if (!payment || (userId && payment.user?.id !== userId)) throw new BookingError(404, 'Order not found.', 'no-payment');
  const bookings = await bookingsOfOrder(strapi, payment);
  const items = [];
  for (const b of bookings) {
    const m = await mailData(strapi, { ...b, userId: payment.user?.id });
    items.push({ reference: b.reference, className: b.classNameSnapshot, sessionDate: String(b.sessionDate).slice(0, 10), startTime: b.startTime, endTime: b.endTime, amount: b.amount ?? 0, status: b.status, room: m.room, coachNames: m.coachNames });
  }
  const raw = payment.rawPayload && typeof payment.rawPayload === 'object' ? payment.rawPayload : {};
  const refunded = Array.isArray((raw as any).refunds) ? (raw as any).refunds.reduce((n: number, r: any) => n + (Number(r.amount) || 0), 0) : payment.status === 'refunded' ? payment.amount : 0;
  return {
    orderId,
    customerName: displayName(payment.user ?? {}),
    customerEmail: payment.user?.email ?? '',
    createdAt: payment.createdAt,
    paidAt: payment.paidAt,
    status: payment.status,
    provider: payment.provider,
    currency: payment.currency ?? 'LKR',
    total: bookings.reduce((n, b) => n + (b.amount ?? 0), 0) || payment.amount,
    refunded,
    items,
  };
}

export async function receiptPdf(strapi: Core.Strapi, orderId: string, userId?: number) {
  return buildReceiptPdf(await receiptData(strapi, orderId, userId));
}

async function notifyOrderConfirmed(strapi: Core.Strapi, orderId: string) {
  try {
    const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking', 'user'] });
    if (!payment) return;
    const bookings = await bookingsOfOrder(strapi, payment);
    const items: BookingMailData[] = [];
    for (const b of bookings) items.push(await mailData(strapi, { ...b, userId: payment.user?.id }));
    if (!items[0]?.email) return;
    const site = (process.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');
    const pdf = await receiptPdf(strapi, orderId);
    await sendEmail(strapi, {
      ...orderConfirmationEmail({ name: items[0].name, email: items[0].email, orderId, total: bookings.reduce((n, b) => n + (b.amount ?? 0), 0), items, receiptUrl: `${site}/account/receipt/${orderId}` }),
      attachments: [{ filename: `receipt-${orderId}.pdf`, content: pdf, contentType: 'application/pdf' }],
    });
    for (const b of bookings) await dq(strapi)(BOOKING).update({ where: { id: b.id }, data: { confirmationSentAt: nowISO() } });
  } catch (err: any) {
    strapi.log.error(`[booking] confirmation email failed for order ${orderId}: ${err?.message ?? err}`);
  }
}

export async function completePayment(strapi: Core.Strapi, orderId: string, providerReference?: string, raw?: unknown) {
  const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking'] });
  if (!payment) throw new BookingError(404, 'Payment not found.', 'no-payment');
  const bookings = await bookingsOfOrder(strapi, payment);
  if (bookings.length === 0) throw new BookingError(404, 'Booking not found.', 'no-booking');
  if (payment.status === 'paid') return { payment, booking: bookings[0], bookings, already: true };

  // Seat check again: a hold may have expired while the member was paying.
  for (const booking of bookings.filter((b) => b.status === 'pending')) {
    const date = String(booking.sessionDate).slice(0, 10);
    const taken = await countTaken(strapi, booking.slotDocumentId, date);
    const slot = await getSlot(strapi, booking.slotDocumentId).catch(() => null);
    const holdValid = booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > Date.now();
    const capacity = Number(slot?.capacity ?? 0);
    if (!holdValid && capacity > 0 && taken >= capacity) {
      await dq(strapi)(PAYMENT).update({ where: { id: payment.id }, data: { status: 'failed', rawPayload: { reason: 'hold-expired-full', raw } } });
      for (const b of bookings) if (b.status === 'pending') await dq(strapi)(BOOKING).update({ where: { id: b.id }, data: { status: 'cancelled', cancelledAt: nowISO() } });
      throw new BookingError(409, `Your seat hold expired and ${booking.classNameSnapshot} on ${date} is now full. No payment was taken.`, 'expired');
    }
  }

  const updatedPayment = await dq(strapi)(PAYMENT).update({
    where: { id: payment.id },
    data: { status: 'paid', paidAt: nowISO(), providerReference: providerReference ?? payment.providerReference, rawPayload: raw ?? payment.rawPayload },
  });
  const confirmed: any[] = [];
  for (const b of bookings) {
    confirmed.push(b.status === 'pending' ? await dq(strapi)(BOOKING).update({ where: { id: b.id }, data: { status: 'confirmed', holdExpiresAt: null } }) : b);
  }
  await notifyOrderConfirmed(strapi, orderId);
  return { payment: updatedPayment, booking: confirmed[0], bookings: confirmed, already: false };
}

export async function failPayment(strapi: Core.Strapi, orderId: string, status: 'failed' | 'cancelled' = 'failed') {
  const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking'] });
  if (!payment) throw new BookingError(404, 'Payment not found.', 'no-payment');
  if (payment.status === 'paid') return { payment, booking: payment.booking };
  const updated = await dq(strapi)(PAYMENT).update({ where: { id: payment.id }, data: { status } });
  // free every held seat straight away
  for (const b of await bookingsOfOrder(strapi, payment)) {
    if (b.status === 'pending') await dq(strapi)(BOOKING).update({ where: { id: b.id }, data: { status: 'cancelled', cancelledAt: nowISO(), holdExpiresAt: null } });
  }
  return { payment: updated, booking: payment.booking };
}

// ── Cancel ──────────────────────────────────────────────────────────────────

export async function cancelBooking(strapi: Core.Strapi, input: { userId: number; bookingDocumentId: string }) {
  const booking = await dq(strapi)(BOOKING).findOne({ where: { documentId: input.bookingDocumentId }, populate: ['user'] });
  if (!booking || booking.user?.id !== input.userId) throw new BookingError(404, 'Booking not found.', 'no-booking');
  if (booking.status === 'cancelled') return booking;
  if (!['pending', 'confirmed'].includes(booking.status)) throw new BookingError(409, 'This booking can no longer be cancelled.', 'locked');

  const startInstant = colomboInstant(String(booking.sessionDate).slice(0, 10), toMinutes(booking.startTime));
  const hoursLeft = (startInstant.getTime() - Date.now()) / 3_600_000;
  if (booking.status === 'confirmed' && hoursLeft < CANCEL_CUTOFF_HOURS) {
    throw new BookingError(409, `Bookings can be cancelled up to ${CANCEL_CUTOFF_HOURS} hours before the session starts. Please contact us.`, 'too-late');
  }

  const wasPaid = booking.status === 'confirmed' && (booking.amount ?? 0) > 0;
  const updated = await dq(strapi)(BOOKING).update({ where: { id: booking.id }, data: { status: 'cancelled', cancelledAt: nowISO(), holdExpiresAt: null } });
  if (wasPaid) {
    // refund just this session against its order's payment (test mode: nothing real moves)
    const pay = booking.orderId
      ? await dq(strapi)(PAYMENT).findOne({ where: { orderId: booking.orderId } })
      : await dq(strapi)(PAYMENT).findOne({ where: { booking: booking.id, status: 'paid' } });
    if (pay) {
      const raw = pay.rawPayload && typeof pay.rawPayload === 'object' ? pay.rawPayload : {};
      const refunds = [...(Array.isArray((raw as any).refunds) ? (raw as any).refunds : []), { reference: booking.reference, amount: booking.amount, at: nowISO(), reason: 'member-cancelled', test: true }];
      const live = booking.orderId ? await dq(strapi)(BOOKING).count({ where: { orderId: booking.orderId, status: 'confirmed' } }) : 0;
      await dq(strapi)(PAYMENT).update({ where: { id: pay.id }, data: { status: live === 0 ? 'refunded' : 'paid', rawPayload: { ...raw, refunds } } });
    }
  } else if (booking.orderId) {
    await releasePending(strapi, { ...booking, id: booking.id });
  } else {
    await dq(strapi)(PAYMENT).updateMany({ where: { booking: booking.id, status: 'pending' }, data: { status: 'cancelled' } });
  }
  try {
    const data = await mailData(strapi, booking);
    if (data.email) await sendEmail(strapi, bookingCancelledEmail({ ...data, refundAmount: wasPaid ? Number(booking.amount) : undefined }));
  } catch { /* email problems never block a cancellation */ }
  return updated;
}

// ── Lists ───────────────────────────────────────────────────────────────────

export async function listForUser(strapi: Core.Strapi, userId: number) {
  const bookings: any[] = await dq(strapi)(BOOKING).findMany({
    where: { user: userId },
    orderBy: [{ sessionDate: 'desc' }, { startTime: 'desc' }],
    limit: 500,
  });
  const payments: any[] = await dq(strapi)(PAYMENT).findMany({
    where: { user: userId },
    populate: ['booking'],
    orderBy: { createdAt: 'desc' },
    limit: 500,
  });
  return { bookings, payments };
}

// ── Reminders (run by the daily cron on the CMS service) ─────────────────────

export async function sendDayBeforeReminders(strapi: Core.Strapi) {
  const tomorrow = addDays(colomboNow().dateISO, 1);
  const due: any[] = await dq(strapi)(BOOKING).findMany({
    where: { status: 'confirmed', sessionDate: tomorrow, reminderSentAt: null },
    limit: 1000,
  });
  let sent = 0;
  for (const b of due) {
    try {
      const data = await mailData(strapi, b);
      if (!data.email) continue;
      await sendEmail(strapi, bookingReminderEmail(data));
      await dq(strapi)(BOOKING).update({ where: { id: b.id }, data: { reminderSentAt: nowISO() } });
      sent++;
    } catch (err: any) {
      strapi.log.error(`[reminders] ${b.reference}: ${err?.message ?? err}`);
    }
  }
  strapi.log.info(`[reminders] ${tomorrow}: ${sent}/${due.length} reminders processed`);
  return { date: tomorrow, due: due.length, sent };
}
