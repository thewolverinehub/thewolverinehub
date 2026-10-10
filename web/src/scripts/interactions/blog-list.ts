/** Journal listing: topic chips, live search, "load more", reveal-on-scroll. */

export function initBlogList() {
  const grid = document.getElementById('bl-grid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll<HTMLElement>('.twh-bl-item'));
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.twh-bl-chip'));
  const input = document.getElementById('bl-search') as HTMLInputElement;
  const count = document.getElementById('bl-count')!;
  const none = document.getElementById('bl-none')!;
  const more = document.getElementById('bl-more') as HTMLButtonElement;
  const reset = document.getElementById('bl-reset') as HTMLButtonElement;
  const initial = Number(grid.dataset.initial ?? 6);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cat = 'all';
  let limit = initial;

  let io: IntersectionObserver | undefined;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-in'));
  } else {
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io!.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
  }

  const apply = () => {
    const terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    const matching = items.filter((i) => (cat === 'all' || i.dataset.cat === cat) && terms.every((t) => (i.dataset.text ?? '').includes(t)));
    items.forEach((i) => { i.hidden = true; });
    matching.forEach((i, n) => {
      i.hidden = n >= limit;
      if (!i.hidden && !i.classList.contains('is-in')) io?.observe(i);
    });
    const shown = Math.min(limit, matching.length);
    count.textContent = matching.length === items.length ? `${items.length} stories` : `${shown} of ${matching.length} matching stories`;
    none.hidden = matching.length > 0;
    more.hidden = matching.length <= limit;
    more.textContent = `Load more stories (${matching.length - limit})`;
  };

  document.getElementById('bl-form')?.addEventListener('submit', (e) => e.preventDefault());
  input.addEventListener('input', () => { limit = initial; apply(); });
  chips.forEach((chip) => chip.addEventListener('click', () => {
    cat = chip.dataset.cat ?? 'all';
    limit = initial;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    apply();
  }));
  more.addEventListener('click', () => { limit += initial; apply(); });
  reset.addEventListener('click', () => {
    input.value = ''; cat = 'all'; limit = initial;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cat === 'all')));
    apply();
  });
  apply();
}
