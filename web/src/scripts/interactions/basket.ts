/**
 * Booking basket — a member can collect sessions (any class, any day) and pay for them in one go.
 * Stored in the browser (localStorage); the server re-validates everything when the order is created,
 * so the basket is only a convenience and can never oversell a class.
 */

export interface BasketItem {
  slotId: string;
  date: string; // YYYY-MM-DD
  slug: string;
  name: string;
  start: string; // "6:00 AM"
  end: string;
  price: number;
  room?: string;
  short: string; // "Mon 12 Oct"
}

const KEY = 'twh-basket-v1';
export const MAX_ITEMS = 12;
const EVENT = 'twh:basket';

const todayColombo = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
const keyOf = (i: Pick<BasketItem, 'slotId' | 'date'>) => `${i.slotId}|${i.date}`;

function read(): BasketItem[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    const today = todayColombo();
    return raw.filter((i: BasketItem) => i && i.slotId && /^\d{4}-\d{2}-\d{2}$/.test(i.date) && i.date >= today).slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function write(items: BasketItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode: basket just won't persist */ }
  window.dispatchEvent(new CustomEvent(EVENT));
}

export const getItems = () => read().sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
export const total = (items = read()) => items.reduce((n, i) => n + (i.price || 0), 0);
export const has = (i: Pick<BasketItem, 'slotId' | 'date'>) => read().some((x) => keyOf(x) === keyOf(i));
export const remove = (i: Pick<BasketItem, 'slotId' | 'date'>) => write(read().filter((x) => keyOf(x) !== keyOf(i)));
export const clear = () => write([]);

/** @returns true when the item is now in the basket, false when it was removed, null when the basket is full */
export function toggle(item: BasketItem): boolean | null {
  const items = read();
  const at = items.findIndex((x) => keyOf(x) === keyOf(item));
  if (at >= 0) { items.splice(at, 1); write(items); return false; }
  if (items.length >= MAX_ITEMS) return null;
  items.push(item);
  write(items);
  return true;
}

export const onChange = (fn: () => void) => {
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', (e) => { if (e.key === KEY) fn(); }); // other tabs
};

export const formatLKR = (n: number) => (n > 0 ? `LKR ${Math.round(n).toLocaleString('en-US')}` : 'Free');

/** Wires every `[data-basket-add]` button (item JSON in data-item): toggles the session and mirrors its state. */
export function initBasketButtons(root: ParentNode = document) {
  const sync = () => {
    root.querySelectorAll<HTMLButtonElement>('[data-basket-add]').forEach((btn) => {
      try {
        const item = JSON.parse(btn.dataset.item ?? '{}') as BasketItem;
        const on = has(item);
        btn.setAttribute('aria-pressed', String(on));
        btn.classList.toggle('is-in', on);
        const label = btn.querySelector<HTMLElement>('[data-label]');
        if (label) label.textContent = on ? 'Added' : (btn.dataset.addLabel ?? 'Add');
      } catch { /* ignore malformed */ }
    });
  };
  root.querySelectorAll<HTMLButtonElement>('[data-basket-add]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const res = toggle(JSON.parse(btn.dataset.item ?? '{}') as BasketItem);
        if (res === null) {
          btn.dataset.full = '1';
          const label = btn.querySelector<HTMLElement>('[data-label]');
          if (label) label.textContent = `Max ${MAX_ITEMS}`;
          window.setTimeout(() => { delete btn.dataset.full; sync(); }, 1600);
        }
      } catch { /* ignore */ }
    });
  });
  onChange(sync);
  sync();
}
