/**
 * Sri Lanka time helpers — every date/time on the site that depends on "now"
 * must go through here so it follows Asia/Colombo (UTC+05:30, no DST),
 * regardless of the visitor's device clock or the server's timezone.
 * Safe to import from both server (Astro frontmatter) and client scripts.
 */

export const COLOMBO_TZ = 'Asia/Colombo';

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type Day = (typeof DAYS)[number];

export interface ColomboNow {
  /** Lower-case weekday, e.g. "sunday" */
  day: Day;
  /** Colombo calendar date, "YYYY-MM-DD" */
  dateISO: string;
  /** Minutes since Colombo midnight (0–1439) */
  minutes: number;
}

const partsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: COLOMBO_TZ,
  weekday: 'long',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getColomboNow(date: Date = new Date()): ColomboNow {
  const p: Record<string, string> = {};
  for (const part of partsFmt.formatToParts(date)) p[part.type] = part.value;
  return {
    day: p.weekday.toLowerCase() as Day,
    dateISO: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

/** "06:00:00" | "06:00" → minutes since midnight */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** minutes since midnight → "6:00 AM" */
export function fmtMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** "06:00:00" → "6:00 AM" */
export function fmtTime(time: string): string {
  return fmtMinutes(toMinutes(time));
}

/** "1 hr 30 min" style duration */
export function fmtDuration(startMin: number, endMin: number): string {
  const d = Math.max(0, endMin - startMin);
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (h && m) return `${h} hr ${m} min`;
  if (h) return `${h} hr`;
  return `${m} min`;
}

/** Monday→Sunday ISO dates of the Colombo week that contains `todayISO`. */
export function weekDates(todayISO: string, todayDay: Day): Record<Day, string> {
  const [y, mo, d] = todayISO.split('-').map(Number);
  const base = Date.UTC(y, mo - 1, d, 12); // noon UTC: immune to day-boundary drift
  const offset = DAYS.indexOf(todayDay);
  const out = {} as Record<Day, string>;
  DAYS.forEach((day, i) => {
    out[day] = new Date(base + (i - offset) * 86_400_000).toISOString().slice(0, 10);
  });
  return out;
}

const labelFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' });
const longFmt  = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });

/** ISO date → { num: "6", month: "Oct", long: "Monday, 6 October" } (calendar date, no tz shift) */
export function dateLabel(iso: string) {
  const dt = new Date(`${iso}T12:00:00Z`);
  const p: Record<string, string> = {};
  for (const part of longFmt.formatToParts(dt)) p[part.type] = part.value;
  return {
    num: String(dt.getUTCDate()),
    month: labelFmt.format(dt).split(' ')[1],
    long: `${p.weekday}, ${p.day} ${p.month}`,
  };
}

const clockFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: COLOMBO_TZ,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const clockDateFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: COLOMBO_TZ,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

/** "8:42 PM" in Colombo */
export const colomboClock = (date: Date = new Date()) => clockFmt.format(date);
/** "Sunday, 5 October" in Colombo */
export const colomboDateLong = (date: Date = new Date()) => {
  const p: Record<string, string> = {};
  for (const part of clockDateFmt.formatToParts(date)) p[part.type] = part.value;
  return `${p.weekday}, ${p.day} ${p.month}`;
};
