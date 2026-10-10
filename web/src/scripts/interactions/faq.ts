/** FAQ page: live search + highlight, topic filter, expand/collapse all, deep links, copy link. */

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function initFaq() {
  const input = document.getElementById('fq-search') as HTMLInputElement | null;
  const form = document.getElementById('fq-form');
  const clear = document.getElementById('fq-clear') as HTMLButtonElement | null;
  const list = document.getElementById('fq-list');
  const count = document.getElementById('fq-count');
  const empty = document.getElementById('fq-empty');
  const toggle = document.getElementById('fq-toggle') as HTMLButtonElement | null;
  if (!input || !list || !count || !empty || !toggle) return;

  const items = Array.from(list.querySelectorAll<HTMLElement>('.twh-fq-item'));
  const topics = Array.from(document.querySelectorAll<HTMLButtonElement>('.twh-fq-topic'));
  const store = items.map((li) => ({
    li,
    details: li.querySelector('details')!,
    q: li.querySelector<HTMLElement>('[data-q]')!,
    qText: li.querySelector<HTMLElement>('[data-q]')!.textContent ?? '',
    a: li.querySelector<HTMLElement>('[data-a]')!,
    aText: (li.querySelector<HTMLElement>('[data-a]')!.textContent ?? '').toLowerCase(),
    cat: li.dataset.cat ?? 'other',
  }));
  let cat = 'all';

  form?.addEventListener('submit', (e) => e.preventDefault());

  const highlight = (el: HTMLElement, original: string, terms: string[]) => {
    if (terms.length === 0) { el.textContent = original; return; }
    const re = new RegExp(`(${terms.map(esc).join('|')})`, 'gi');
    el.innerHTML = original.split(re).map((part, i) => (i % 2 ? `<mark>${part.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!))}</mark>` : part.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!)))).join('');
  };

  const apply = () => {
    const terms = input.value.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    let shown = 0;
    store.forEach((s) => {
      const hay = `${s.qText.toLowerCase()} ${s.aText}`;
      const match = (cat === 'all' || s.cat === cat) && terms.every((t) => hay.includes(t));
      s.li.hidden = !match;
      highlight(s.q, s.qText, match ? terms : []);
      if (match) {
        shown++;
        // open answers that only match in the body so the visitor sees why it matched
        if (terms.length && terms.some((t) => s.aText.includes(t)) && !terms.every((t) => s.qText.toLowerCase().includes(t))) s.details.open = true;
      } else if (terms.length) {
        s.details.open = false;
      }
    });
    count.textContent = terms.length || cat !== 'all' ? `${shown} of ${store.length} questions` : `${store.length} questions`;
    empty.hidden = shown !== 0;
    if (clear) clear.hidden = input.value.length === 0;
    syncToggle();
  };

  const visible = () => store.filter((s) => !s.li.hidden);
  const syncToggle = () => {
    const v = visible();
    const allOpen = v.length > 0 && v.every((s) => s.details.open);
    toggle.dataset.state = allOpen ? 'expanded' : 'collapsed';
    toggle.textContent = allOpen ? 'Collapse all' : 'Expand all';
    toggle.disabled = v.length === 0;
  };

  input.addEventListener('input', apply);
  clear?.addEventListener('click', () => { input.value = ''; apply(); input.focus(); });
  topics.forEach((t) => t.addEventListener('click', () => {
    cat = t.dataset.cat ?? 'all';
    topics.forEach((x) => x.setAttribute('aria-pressed', String(x === t)));
    apply();
  }));
  toggle.addEventListener('click', () => {
    const open = toggle.dataset.state !== 'expanded';
    visible().forEach((s) => { s.details.open = open; });
    syncToggle();
  });
  store.forEach((s) => s.details.addEventListener('toggle', syncToggle));

  // "/" focuses the search (unless typing somewhere else)
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') { e.preventDefault(); input.focus(); }
    if (e.key === 'Escape' && document.activeElement === input) { input.value = ''; apply(); input.blur(); }
  });

  // deep links + popular chips
  const open = (id: string, scroll = true) => {
    const s = store.find((x) => x.li.id === id);
    if (!s) return;
    if (cat !== 'all' || input.value) { cat = 'all'; input.value = ''; topics.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === 'all'))); apply(); }
    s.details.open = true;
    if (scroll) s.li.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    s.li.classList.add('is-flash');
    window.setTimeout(() => s.li.classList.remove('is-flash'), 1800);
  };
  document.querySelectorAll<HTMLAnchorElement>('[data-jump]').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.dataset.jump!;
    history.replaceState(null, '', `#${id}`);
    open(id);
  }));
  if (location.hash.startsWith('#q-')) window.setTimeout(() => open(location.hash.slice(1)), 150);

  document.querySelectorAll<HTMLButtonElement>('[data-copy-link]').forEach((b) => b.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}${b.dataset.copyLink}`;
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    const label = b.textContent;
    b.textContent = 'Link copied ✓';
    window.setTimeout(() => { b.textContent = label; }, 1500);
  }));

  apply();
}
