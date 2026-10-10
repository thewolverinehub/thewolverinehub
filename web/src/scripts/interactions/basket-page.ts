/** Basket page: render the basket, remove items, pay (creates ONE order for every session). */
import { clear, formatLKR, getItems, onChange, remove, total, type BasketItem } from './basket';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export function initBasketPage() {
  const list = document.getElementById('bk-items');
  if (!list) return;
  const count = document.getElementById('bk-count')!;
  const empty = document.getElementById('bk-empty')!;
  const clearBtn = document.getElementById('bk-clear') as HTMLButtonElement;
  const lines = document.getElementById('bk-lines')!;
  const totalEl = document.getElementById('bk-total')!;
  const pay = document.getElementById('bk-pay') as HTMLButtonElement | null;
  const err = document.getElementById('bk-error')!;

  const render = () => {
    const items = getItems();
    count.textContent = String(items.length);
    empty.hidden = items.length > 0;
    clearBtn.hidden = items.length === 0;
    list.innerHTML = items.map((i: BasketItem) => {
      const [dow, num, mon] = i.short.split(' ');
      return `<li class="twh-bk-item" data-key="${esc(i.slotId)}|${esc(i.date)}">
  <span class="twh-bk-item__date"><i>${esc(dow)}</i><b>${esc(num)}</b><i>${esc(mon)}</i></span>
  <span class="twh-bk-item__body"><a href="/classes/${esc(i.slug)}">${esc(i.name)}</a><small>${esc(i.start)} – ${esc(i.end)} · Sri Lanka time${i.room ? ` · ${esc(i.room)}` : ''}</small></span>
  <span class="twh-bk-item__price">${formatLKR(i.price)}</span>
  <button type="button" class="twh-bk-item__rm" aria-label="Remove ${esc(i.name)} on ${esc(i.short)}" data-rm>×</button>
</li>`;
    }).join('');

    // summary: per class totals
    const byClass = new Map<string, { n: number; sum: number; name: string }>();
    items.forEach((i) => { const c = byClass.get(i.slug) ?? { n: 0, sum: 0, name: i.name }; c.n++; c.sum += i.price; byClass.set(i.slug, c); });
    lines.innerHTML = items.length
      ? [...byClass.values()].map((c) => `<li><span>${esc(c.name)} × ${c.n}</span><b>${formatLKR(c.sum)}</b></li>`).join('')
      : '<li class="twh-bk-sum__none">Nothing selected yet.</li>';
    totalEl.textContent = formatLKR(total(items));
    if (pay) { pay.disabled = items.length === 0; pay.textContent = items.length ? (total(items) > 0 ? `Pay ${formatLKR(total(items))}` : 'Confirm free booking') : 'Pay now'; }
  };

  list.addEventListener('click', (e) => {
    const rm = (e.target as HTMLElement).closest('[data-rm]');
    if (!rm) return;
    const key = rm.closest<HTMLElement>('.twh-bk-item')!.dataset.key!.split('|');
    remove({ slotId: key[0], date: key[1] });
  });
  clearBtn.addEventListener('click', () => clear());
  onChange(render);
  render();

  pay?.addEventListener('click', async () => {
    const items = getItems();
    if (items.length === 0) return;
    err.hidden = true;
    pay.disabled = true;
    const label = pay.textContent;
    pay.textContent = 'Reserving your seats…';
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i) => ({ slotId: i.slotId, date: i.date })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        clear(); // the seats are now held in an order — resume from My Bookings if the payment is abandoned
        window.location.assign(data.redirect);
        return;
      }
      if (data.code === 'auth') { window.location.assign('/login?next=%2Fbasket'); return; }
      err.textContent = data.message || 'We could not reserve those seats. Please try again.';
    } catch {
      err.textContent = 'Network problem. Please check your connection and try again.';
    }
    err.hidden = false;
    pay.disabled = false;
    pay.textContent = label;
  });
}
