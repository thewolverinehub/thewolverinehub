/**
 * Session (a weekly slot on a specific date) helpers shared by the schedule, class and booking pages.
 * Mirrors the rules enforced by the CMS (cms/src/utils/booking.ts) so the UI never offers something
 * the server will refuse.
 */
import { addDays, dateLabel, fmtMinutes, getColomboNow, toMinutes, weekdayOf, type ColomboNow, type Day } from '../utils/colombo';

/** Members can book up to this many days ahead (same as the CMS). */
export const BOOKING_WINDOW_DAYS = 30;

/** Booking closes when a session starts; long "day time" sessions (4 h+) stay open until 1 h before the end. */
export const cutoffMinutes = (startMin: number, endMin: number) => (endMin - startMin >= 240 ? endMin - 60 : startMin);

export type SessionState = 'open' | 'full' | 'closed';

export interface SlotInput {
  documentId: string;
  weekday: Day;
  startTime: string;
  endTime: string;
  capacity: number;
  room?: string | null;
}

export interface SessionOption {
  slotId: string;
  date: string;
  weekday: Day;
  startMin: number;
  endMin: number;
  start: string;
  end: string;
  capacity: number;
  taken: number;
  left: number;
  state: SessionState;
  room: string;
  /** "Mon 13 Oct" */
  short: string;
  /** "Monday, 13 October" */
  long: string;
}

export function sessionFor(slot: SlotInput, date: string, taken: Record<string, number>, now: ColomboNow = getColomboNow()): SessionOption {
  const startMin = toMinutes(slot.startTime);
  const endMin = toMinutes(slot.endTime);
  const count = taken[`${slot.documentId}|${date}`] ?? 0;
  const left = Math.max(0, (slot.capacity ?? 0) - count);
  const closed = date < now.dateISO || (date === now.dateISO && now.minutes >= cutoffMinutes(startMin, endMin));
  const label = dateLabel(date);
  return {
    slotId: slot.documentId,
    date,
    weekday: slot.weekday,
    startMin,
    endMin,
    start: fmtMinutes(startMin),
    end: fmtMinutes(endMin),
    capacity: slot.capacity ?? 0,
    taken: count,
    left,
    state: closed ? 'closed' : slot.capacity > 0 && left === 0 ? 'full' : 'open',
    room: slot.room ?? '',
    short: `${label.long.split(',')[0].slice(0, 3)} ${label.num} ${label.month}`,
    long: label.long,
  };
}

/** The next `count` bookable dates for a slot's weekday (today included while booking is still open). */
export function upcomingDates(slot: SlotInput, count: number, now: ColomboNow = getColomboNow()): string[] {
  const startMin = toMinutes(slot.startTime);
  const endMin = toMinutes(slot.endTime);
  const out: string[] = [];
  for (let i = 0; i <= BOOKING_WINDOW_DAYS && out.length < count; i++) {
    const d = addDays(now.dateISO, i);
    if (weekdayOf(d) !== slot.weekday) continue;
    if (d === now.dateISO && now.minutes >= cutoffMinutes(startMin, endMin)) continue;
    out.push(d);
  }
  return out;
}

export const spotsLabel = (s: Pick<SessionOption, 'state' | 'left'>) =>
  s.state === 'closed' ? 'Closed' : s.state === 'full' ? 'Full' : s.left <= 3 ? `Only ${s.left} left` : `${s.left} spots left`;
