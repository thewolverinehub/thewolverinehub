/**
 * Turns a member's raw bookings + payments into what the dashboard shows
 * (upcoming / past / cancelled, training record, spend). All "now" decisions use Sri Lanka time.
 */
import type { Booking, Payment } from '../auth/cms';
import { dateLabel, getColomboNow, toMinutes, type ColomboNow } from '../utils/colombo';
import { CANCEL_CUTOFF_HOURS } from './rules';

export type BookingView = Booking & {
  date: string;
  startMin: number;
  endMin: number;
  /** "Mon 13 Oct" */
  short: string;
  /** "Monday, 13 October" */
  long: string;
  bucket: 'upcoming' | 'past' | 'cancelled';
  /** human status shown on the badge */
  label: string;
  tone: 'good' | 'warn' | 'bad' | 'muted';
  canCancel: boolean;
  awaitingPayment: boolean;
  /** order id to resume checkout for a pending booking */
  orderId?: string;
};

const WEEKDAY_SHORT = (long: string) => long.split(',')[0].slice(0, 3);

export function viewBookings(bookings: Booking[], payments: Payment[], now: ColomboNow = getColomboNow()): BookingView[] {
  const pendingOrder = new Map<number, string>();
  for (const p of payments) if (p.status === 'pending' && p.booking?.id) pendingOrder.set(p.booking.id, p.orderId);

  return bookings.map((b) => {
    const date = String(b.sessionDate).slice(0, 10);
    const startMin = toMinutes(b.startTime);
    const endMin = toMinutes(b.endTime);
    const lab = dateLabel(date);
    const ended = date < now.dateISO || (date === now.dateISO && now.minutes >= endMin);
    const holdValid = Boolean(b.holdExpiresAt) && new Date(b.holdExpiresAt!).getTime() > Date.now();

    let bucket: BookingView['bucket'];
    let label: string;
    let tone: BookingView['tone'];
    if (b.status === 'cancelled') { bucket = 'cancelled'; label = 'Cancelled'; tone = 'muted'; }
    else if (b.status === 'pending') {
      if (holdValid && !ended) { bucket = 'upcoming'; label = 'Awaiting payment'; tone = 'warn'; }
      else { bucket = 'cancelled'; label = 'Expired'; tone = 'muted'; }
    } else if (b.status === 'no-show') { bucket = 'past'; label = 'Missed'; tone = 'bad'; }
    else if (ended) { bucket = 'past'; label = b.status === 'attended' ? 'Attended' : 'Completed'; tone = 'good'; }
    else { bucket = 'upcoming'; label = 'Confirmed'; tone = 'good'; }

    // same rule the CMS enforces
    const startInstant = new Date(`${date}T${String(Math.floor(startMin / 60)).padStart(2, '0')}:${String(startMin % 60).padStart(2, '0')}:00+05:30`).getTime();
    const hoursLeft = (startInstant - Date.now()) / 3_600_000;
    const awaitingPayment = b.status === 'pending' && holdValid;

    return {
      ...b,
      date, startMin, endMin,
      short: `${WEEKDAY_SHORT(lab.long)} ${lab.num} ${lab.month}`,
      long: lab.long,
      bucket, label, tone,
      canCancel: bucket === 'upcoming' && (awaitingPayment || hoursLeft >= CANCEL_CUTOFF_HOURS),
      awaitingPayment,
      orderId: pendingOrder.get(b.id),
    };
  });
}

export interface MemberStats {
  upcoming: BookingView[];
  past: BookingView[];
  cancelled: BookingView[];
  sessionsDone: number;
  sessionsThisMonth: number;
  totalPaid: number;
  favourite: { name: string; count: number } | null;
  next: BookingView | null;
}

export function memberStats(views: BookingView[], payments: Payment[], now: ColomboNow = getColomboNow()): MemberStats {
  const upcoming = views.filter((v) => v.bucket === 'upcoming').sort((a, b) => a.date.localeCompare(b.date) || a.startMin - b.startMin);
  const past = views.filter((v) => v.bucket === 'past').sort((a, b) => b.date.localeCompare(a.date) || b.startMin - a.startMin);
  const cancelled = views.filter((v) => v.bucket === 'cancelled').sort((a, b) => b.date.localeCompare(a.date));

  const month = now.dateISO.slice(0, 7);
  const counts = new Map<string, number>();
  for (const v of past) counts.set(v.classNameSnapshot, (counts.get(v.classNameSnapshot) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    upcoming, past, cancelled,
    sessionsDone: past.length,
    sessionsThisMonth: past.filter((v) => v.date.startsWith(month)).length,
    totalPaid: payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + (p.amount ?? 0), 0),
    favourite: top ? { name: top[0], count: top[1] } : null,
    next: upcoming.find((u) => u.status === 'confirmed') ?? null,
  };
}

/** How complete a member's profile is (drives the dashboard nudge). */
export function profileCompleteness(m: Record<string, unknown>) {
  const checks: [string, boolean][] = [
    ['Full name', Boolean(m.fullName)],
    ['Phone number', Boolean(m.phone)],
    ['Date of birth', Boolean(m.dateOfBirth)],
    ['Emergency contact', Boolean(m.emergencyContactName && m.emergencyContactPhone)],
    ['Your goals', Boolean(m.fitnessGoals)],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([n]) => n) };
}
