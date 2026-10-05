/**
 * Schedule logic shared by the server render and the client's live updates.
 * All "now" values come from getColomboNow() (Asia/Colombo).
 */
import { DAYS, fmtMinutes, type ColomboNow, type Day } from './colombo';

export interface SlotLite {
  id: string;
  day: Day;
  startMin: number;
  endMin: number;
  name: string;
  room: string;
  slug: string;
}

export type SlotState = 'live' | 'soon' | 'upcoming' | 'done';

/** A class counts as "starting soon" when it begins within this many minutes. */
export const SOON_MINUTES = 60;

export function slotState(slot: Pick<SlotLite, 'startMin' | 'endMin'>, nowMin: number): SlotState {
  if (nowMin >= slot.endMin) return 'done';
  if (nowMin >= slot.startMin) return 'live';
  if (slot.startMin - nowMin <= SOON_MINUTES) return 'soon';
  return 'upcoming';
}

/** 35 → "in 35 min", 65 → "in 1 hr 5 min" */
export function inLabel(minutes: number): string {
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `in ${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `in ${h} hr ${r} min` : `in ${h} hr`;
}

export interface NextUp {
  slot: SlotLite;
  /** 0 = today */
  daysAhead: number;
  state: SlotState | 'later';
}

/** The live class, or the next one to start (rolling into the following days). */
export function findNext(slots: SlotLite[], now: ColomboNow): NextUp | null {
  const todayIdx = DAYS.indexOf(now.day);
  for (let ahead = 0; ahead <= 7; ahead++) {
    const day = DAYS[(todayIdx + ahead) % 7];
    const list = slots.filter((s) => s.day === day).sort((a, b) => a.startMin - b.startMin);
    for (const slot of list) {
      if (ahead === 0) {
        if (now.minutes >= slot.endMin) continue;
        return { slot, daysAhead: 0, state: slotState(slot, now.minutes) };
      }
      return { slot, daysAhead: ahead, state: 'later' };
    }
  }
  return null;
}

export interface NextLabel {
  kicker: string;
  title: string;
  detail: string;
  live: boolean;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function nextLabel(next: NextUp | null, now: ColomboNow): NextLabel {
  if (!next) {
    return { kicker: 'Timetable', title: 'No upcoming classes', detail: 'Check back soon.', live: false };
  }
  const { slot, daysAhead, state } = next;
  const room = slot.room ? ` · ${slot.room}` : '';
  if (state === 'live') {
    return { kicker: 'Live now', title: slot.name, detail: `Ends ${inLabel(slot.endMin - now.minutes)}${room}`, live: true };
  }
  if (state === 'soon') {
    return { kicker: 'Next up', title: slot.name, detail: `Starts ${inLabel(slot.startMin - now.minutes)} · ${fmtMinutes(slot.startMin)}${room}`, live: false };
  }
  if (daysAhead === 0) {
    return { kicker: 'Next up', title: slot.name, detail: `Today at ${fmtMinutes(slot.startMin)}${room}`, live: false };
  }
  const when = daysAhead === 1 ? 'Tomorrow' : cap(slot.day);
  return { kicker: 'Next up', title: slot.name, detail: `${when} at ${fmtMinutes(slot.startMin)}${room}`, live: false };
}

export const STATE_LABEL: Record<SlotState, string> = {
  live: 'Live now',
  soon: 'Starting soon',
  upcoming: '',
  done: 'Finished',
};
