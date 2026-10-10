import crypto from 'node:crypto';
import type { Core } from '@strapi/strapi';
import { addDays, bookingCutoffMinutes, colomboNow, toMinutes, weekdayOf } from './colombo';
import {
  bookingCancelledEmail,
  bookingConfirmationEmail,
  bookingReminderEmail,
  sendEmail,
  type BookingMailData,
} from './email';

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

// ── Reserve ─────────────────────────────────────────────────────────────────

export async function reserve(
  strapi: Core.Strapi,
  input: { userId: number; slotDocumentId: string; date: string },
) {
  const { userId, slotDocumentId, date } = input;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BookingError(400, 'Invalid date.', 'bad-date');

  const slot = await getSlot(strapi, slotDocumentId);
  if (!slot || slot.isActive === false || !slot.class) throw new BookingError(404, 'That session is not available.', 'no-slot');
  if (weekdayOf(date) !== slot.weekday) throw new BookingError(400, 'That class does not run on this date.', 'wrong-day');

  const now = colomboNow();
  if (date < now.dateISO) throw new BookingError(400, 'That date has already passed.', 'past');
  if (date > addDays(now.dateISO, BOOKING_WINDOW_DAYS)) throw new BookingError(400, `You can book up to ${BOOKING_WINDOW_DAYS} days ahead.`, 'too-far');

  const startMin = toMinutes(slot.startTime);
  const endMin = toMinutes(slot.endTime);
  if (date === now.dateISO && now.minutes >= bookingCutoffMinutes(startMin, endMin)) {
    throw new BookingError(409, 'Booking for this session has closed.', 'closed');
  }

  await loadUser(strapi, userId);
  const price = Number(slot.class.price ?? 0) || 0;
  const free = price === 0 || slot.class.isFree === true;
  const amount = free ? 0 : price;

  return strapi.db.transaction(async ({ trx }: any) => {
    // Serialise concurrent bookings of the same session so capacity can never be oversold.
    try {
      const lock = BigInt('0x' + crypto.createHash('sha1').update(`${slotDocumentId}|${date}`).digest('hex').slice(0, 15));
      await trx.raw('select pg_advisory_xact_lock(?)', [lock.toString()]);
    } catch { /* non-postgres dev DB: best effort */ }

    const existing = await dq(strapi)(BOOKING).findOne({
      where: {
        slotDocumentId,
        sessionDate: date,
        user: userId,
        $or: [{ status: 'confirmed' }, { status: 'pending', holdExpiresAt: { $gt: nowISO() } }],
      },
    });
    if (existing) {
      if (existing.status === 'pending') {
        // resume the checkout they already started
        const pay = await dq(strapi)(PAYMENT).findOne({ where: { booking: existing.id, status: 'pending' }, orderBy: { id: 'desc' } });
        return { booking: existing, payment: pay, resumed: true };
      }
      throw new BookingError(409, 'You are already booked into this session.', 'duplicate');
    }

    const taken = await countTaken(strapi, slotDocumentId, date);
    const capacity = Number(slot.capacity ?? 0);
    if (capacity > 0 && taken >= capacity) throw new BookingError(409, 'Sorry — this session is full.', 'full');

    const booking = await dq(strapi)(BOOKING).create({
      data: {
        reference: newReference(),
        user: userId,
        classDocumentId: slot.class.documentId,
        classSlug: slot.class.slug,
        slotDocumentId,
        sessionDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classNameSnapshot: slot.class.name,
        amount,
        currency: 'LKR',
        status: free ? 'confirmed' : 'pending',
        holdExpiresAt: free ? null : new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
      },
    });

    const payment = await dq(strapi)(PAYMENT).create({
      data: {
        orderId: newOrderId(),
        booking: booking.id,
        user: userId,
        amount,
        currency: 'LKR',
        provider: free ? 'free' : (process.env.PAYMENT_MODE === 'payhere' ? 'payhere' : 'preview'),
        status: free ? 'paid' : 'pending',
        paidAt: free ? nowISO() : null,
      },
    });

    return { booking, payment, resumed: false };
  }).then(async (result: any) => {
    if (result.booking.status === 'confirmed' && !result.resumed) await notifyConfirmed(strapi, result.booking);
    return result;
  });
}

// ── Payment results ─────────────────────────────────────────────────────────

async function notifyConfirmed(strapi: Core.Strapi, booking: any) {
  try {
    const data = await mailData(strapi, booking);
    if (data.email) {
      await sendEmail(strapi, bookingConfirmationEmail(data));
      await dq(strapi)(BOOKING).update({ where: { id: booking.id }, data: { confirmationSentAt: nowISO() } });
    }
  } catch (err: any) {
    strapi.log.error(`[booking] confirmation email failed for ${booking.reference}: ${err?.message ?? err}`);
  }
}

export async function completePayment(strapi: Core.Strapi, orderId: string, providerReference?: string, raw?: unknown) {
  const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking'] });
  if (!payment) throw new BookingError(404, 'Payment not found.', 'no-payment');
  const booking = payment.booking;
  if (!booking) throw new BookingError(404, 'Booking not found.', 'no-booking');
  if (payment.status === 'paid') return { payment, booking, already: true };

  // Seat check again: the hold may have expired while the member was paying.
  if (booking.status !== 'confirmed') {
    const taken = await countTaken(strapi, booking.slotDocumentId, String(booking.sessionDate).slice(0, 10));
    const slot = await getSlot(strapi, booking.slotDocumentId).catch(() => null);
    const holdValid = booking.holdExpiresAt && new Date(booking.holdExpiresAt).getTime() > Date.now();
    const capacity = Number(slot?.capacity ?? 0);
    if (!holdValid && capacity > 0 && taken >= capacity) {
      await dq(strapi)(PAYMENT).update({ where: { id: payment.id }, data: { status: 'failed', rawPayload: { reason: 'hold-expired-full', raw } } });
      await dq(strapi)(BOOKING).update({ where: { id: booking.id }, data: { status: 'cancelled', cancelledAt: nowISO() } });
      throw new BookingError(409, 'Your seat hold expired and the session is now full. No payment was taken.', 'expired');
    }
  }

  const updatedPayment = await dq(strapi)(PAYMENT).update({
    where: { id: payment.id },
    data: { status: 'paid', paidAt: nowISO(), providerReference: providerReference ?? payment.providerReference, rawPayload: raw ?? payment.rawPayload },
  });
  const updatedBooking = await dq(strapi)(BOOKING).update({
    where: { id: booking.id },
    data: { status: 'confirmed', holdExpiresAt: null },
  });
  await notifyConfirmed(strapi, updatedBooking);
  return { payment: updatedPayment, booking: updatedBooking, already: false };
}

export async function failPayment(strapi: Core.Strapi, orderId: string, status: 'failed' | 'cancelled' = 'failed') {
  const payment = await dq(strapi)(PAYMENT).findOne({ where: { orderId }, populate: ['booking'] });
  if (!payment) throw new BookingError(404, 'Payment not found.', 'no-payment');
  if (payment.status === 'paid') return { payment, booking: payment.booking };
  const updated = await dq(strapi)(PAYMENT).update({ where: { id: payment.id }, data: { status } });
  // free the seat straight away
  if (payment.booking && payment.booking.status === 'pending') {
    await dq(strapi)(BOOKING).update({ where: { id: payment.booking.id }, data: { status: 'cancelled', cancelledAt: nowISO() } });
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
    const paidRows: any[] = await dq(strapi)(PAYMENT).findMany({ where: { booking: booking.id, status: 'paid' } });
    for (const p of paidRows) {
      await dq(strapi)(PAYMENT).update({
        where: { id: p.id },
        data: {
          status: 'refunded',
          rawPayload: { ...(p.rawPayload && typeof p.rawPayload === 'object' ? p.rawPayload : {}), refund: { amount: p.amount, at: nowISO(), reason: 'member-cancelled', test: true } },
        },
      });
    }
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
