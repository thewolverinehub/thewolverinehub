/** Article page: reading progress, "in this article" contents with scroll-spy, copy link. */

export function initArticle() {
  const prose = document.getElementById('ar-prose');
  if (!prose) return;

  // ── reading progress ────────────────────────────────────────
  const bar = document.querySelector<HTMLElement>('#ar-progress span');
  const update = () => {
    if (!bar) return;
    const r = prose.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.5;
    const done = Math.min(Math.max(-r.top + window.innerHeight * 0.25, 0), Math.max(total, 1));
    bar.style.transform = `scaleX(${total > 0 ? done / total : 1})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // ── contents from headings ──────────────────────────────────
  const heads = Array.from(prose.querySelectorAll<HTMLHeadingElement>('h2, h3'));
  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const used = new Set<string>();
  heads.forEach((h) => {
    let id = slugify(h.textContent ?? '') || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    h.id = id;
  });

  if (heads.length >= 2) {
    const links = heads.map((h) => `<li class="${h.tagName === 'H3' ? 'is-sub' : ''}"><a href="#${h.id}" data-toc="${h.id}">${(h.textContent ?? '').replace(/</g, '&lt;')}</a></li>`).join('');
    document.querySelectorAll<HTMLElement>('.twh-ar-toc').forEach((toc) => {
      toc.querySelector('ol')!.innerHTML = links;
      toc.hidden = false;
    });
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc]'));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) anchors.forEach((a) => a.classList.toggle('is-active', a.dataset.toc === e.target.id));
        });
      }, { rootMargin: '-15% 0px -75% 0px' });
      heads.forEach((h) => io.observe(h));
    }
  }

  // ── copy link ───────────────────────────────────────────────
  const btn = document.querySelector<HTMLButtonElement>('[data-copy-url]');
  const toast = document.querySelector<HTMLElement>('.twh-ar-share__toast');
  btn?.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(btn.dataset.copyUrl ?? location.href); } catch { /* ignore */ }
    if (toast) { toast.hidden = false; window.setTimeout(() => { toast.hidden = true; }, 1600); }
  });
}
