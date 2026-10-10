/** Gallery page: category filter, layout toggle, "show more", reveal-on-scroll. */

export function initGallery() {
  const grid = document.getElementById('gl-grid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll<HTMLElement>('.twh-gl-item'));
  const chips = Array.from(document.querySelectorAll<HTMLButtonElement>('.twh-gl-chip'));
  const views = Array.from(document.querySelectorAll<HTMLButtonElement>('.twh-gl-view__btn'));
  const count = document.getElementById('gl-count')!;
  const more = document.getElementById('gl-more') as HTMLButtonElement;
  const initial = Number(grid.dataset.initial ?? 12);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cat = 'all';
  let limit = initial;

  const apply = () => {
    const matching = items.filter((i) => cat === 'all' || i.dataset.cat === cat);
    items.forEach((i) => { i.hidden = true; });
    matching.forEach((i, n) => {
      const show = n < limit;
      i.hidden = !show;
      if (show && !i.classList.contains('is-in')) revealObserver?.observe(i);
    });
    const shown = Math.min(limit, matching.length);
    count.textContent = `Showing ${shown} of ${matching.length}${cat === 'all' ? '' : ` in ${cat}`}`;
    more.hidden = matching.length <= limit;
    more.textContent = `Show more photos (${matching.length - limit})`;
  };

  let revealObserver: IntersectionObserver | undefined;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((i) => i.classList.add('is-in'));
  } else {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); revealObserver!.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  }

  chips.forEach((chip) => chip.addEventListener('click', () => {
    cat = chip.dataset.cat ?? 'all';
    limit = initial;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    apply();
  }));

  views.forEach((v) => v.addEventListener('click', () => {
    grid.dataset.view = v.dataset.view ?? 'mosaic';
    views.forEach((x) => x.setAttribute('aria-pressed', String(x === v)));
  }));

  more.addEventListener('click', () => { limit += initial; apply(); });
  apply();
}
