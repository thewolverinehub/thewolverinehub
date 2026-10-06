/**
 * Sri Lanka time helpers for the CMS (Asia/Colombo, UTC+05:30, no DST).
 * Mirrors web/src/lib/utils/colombo.ts — every "today / tomorrow / has it started?" decision
 * in bookings and reminders must use these, never the server's local timezone.
 */

export const COLOMBO_TZ = 'Asia/Colombo';

export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: COLOMBO_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export interface ColomboNow {
  /** "YYYY-MM-DD" */
  dateISO: string;
  /** minutes since Colombo midnight */
  minutes: number;
  weekday: Weekday;
}

export function colomboNow(date: Date = new Date()): ColomboNow {
  const p: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) p[part.type] = part.value;
  const dateISO = `${p.year}-${p.month}-${p.day}`;
  return { dateISO, minutes: Number(p.hour) * 60 + Number(p.minute), weekday: weekdayOf(dateISO) };
}

/** Weekday of a calendar date (no timezone shift — it is a plain date). */
export function weekdayOf(dateISO: string): Weekday {
  return WEEKDAYS[new Date(`${dateISO}T12:00:00Z`).getUTCDay()];
}

export function addDays(dateISO: string, days: number): string {
  const d = new Date(`${dateISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "06:00:00.000" | "06:00" → minutes */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** minutes → "6:00 AM" */
export function fmtMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function fmtTime(time: string): string {
  return fmtMinutes(toMinutes(time));
}

const longFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
/** "Monday, 6 October 2026" */
export function longDate(dateISO: string): string {
  const parts: Record<string, string> = {};
  for (const p of longFmt.formatToParts(new Date(`${dateISO}T12:00:00Z`))) parts[p.type] = p.value;
  return `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`;
}

/**
 * Booking closes when a session starts. For long "day time" sessions (4 h or more, like Open Gym)
 * it stays open until one hour before the end, so a day pass can still be bought during the day.
 */
export function bookingCutoffMinutes(startMin: number, endMin: number): number {
  return endMin - startMin >= 240 ? endMin - 60 : startMin;
}
