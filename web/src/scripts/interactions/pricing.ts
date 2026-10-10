/** Pricing page: rate-ladder filter + bar reveal, hero price counter, "Plan your week" calculator. */

const fmt = (n: number) => `LKR ${Math.round(n).toLocaleString('en-US')}`;

export function initPricing() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Hero price counter ─────────────────────────────────────
  const counter = document.querySelector<HTMLElement>('[data-count-to]');
  if (counter && !reduced) {
    const to = Number(counter.dataset.countTo ?? 0);
    if (to > 0) {
      const prefix = counter.dataset.prefix ?? '';
      const t0 = performance.now();
      const dur = 1100;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        counter.textContent = `${prefix}${Math.round(to * eased).toLocaleString('en-US')}`;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }

  // ── Price tickets: reveal on scroll + tier filter ──────────
  const grid = document.getElementById('ladder');
  const tickets = grid ? Array.from(grid.querySelectorAll<HTMLElement>('.twh-px-ticket')) : [];
  if (reduced || !('IntersectionObserver' in window)) {
    tickets.forEach((t) => t.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    tickets.forEach((t, i) => { t.style.setProperty('--d', `${(i % 4) * 70}ms`); io.observe(t); });
  }
  const chips = document.querySelectorAll<HTMLButtonElement>('.twh-px-chip');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const tier = chip.dataset.tier!;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    tickets.forEach((t) => { t.hidden = tier !== 'all' && t.dataset.tier !== tier; });
  }));

  // ── Planner ────────────────────────────────────────────────
  const root = document.querySelector<HTMLElement>('[data-planner]');
  if (!root) return;
  const picks = Array.from(root.querySelectorAll<HTMLElement>('.twh-px-pick'));
  const state = new Map<string, number>(); // slug -> sessions per week
  const out = {
    week: root.querySelector<HTMLElement>('[data-week]')!,
    month: root.querySelector<HTMLElement>('[data-month]')!,
    sessions: root.querySelector<HTMLElement>('[data-sessions]')!,
    lines: root.querySelector<HTMLElement>('[data-lines]')!,
    cta: root.querySelector<HTMLAnchorElement>('[data-cta]')!,
  };
  const names = new Map(picks.map((p) => [p.dataset.slug!, p.querySelector('b')!.textContent!]));

  const render = () => {
    let week = 0;
    let sessions = 0;
    const lines: string[] = [];
    picks.forEach((p) => {
      const slug = p.dataset.slug!;
      const n = state.get(slug) ?? 0;
      const on = n > 0;
      p.classList.toggle('is-on', on);
      p.querySelector('.twh-px-pick__toggle')!.setAttribute('aria-pressed', String(on));
      const step = p.querySelector<HTMLElement>('.twh-px-step')!;
      step.hidden = !on;
      p.querySelector<HTMLElement>('[data-val]')!.textContent = String(n);
      if (on) {
        const price = Number(p.dataset.price);
        week += price * n;
        sessions += n;
        lines.push(`<li><span>${names.get(slug)} × ${n}</span><b>${price === 0 ? 'Free' : fmt(price * n)}</b></li>`);
      }
    });
    out.week.textContent = fmt(week);
    out.month.textContent = fmt(week * 4.33);
    out.sessions.textContent = String(sessions);
    out.lines.innerHTML = lines.length ? lines.join('') : '<li class="twh-px-sum__empty">Choose a class to start.</li>';
    const chosen = Array.from(state.keys()).filter((k) => (state.get(k) ?? 0) > 0);
    out.cta.href = chosen.length ? `/basket?classes=${chosen.map(encodeURIComponent).join(',')}#add` : '/basket';
    // mirror the planner onto the price tickets
    document.querySelectorAll<HTMLButtonElement>('[data-plan-toggle]').forEach((b) => {
      const on = chosen.includes(b.dataset.planToggle!);
      b.setAttribute('aria-pressed', String(on));
      b.classList.toggle('is-on', on);
      const l = b.querySelector('[data-label]'); if (l) l.textContent = on ? '✓ In plan' : '+ Plan';
    });
  };

  picks.forEach((p) => {
    const slug = p.dataset.slug!;
    const max = Number(p.dataset.max ?? 1);
    p.querySelector('.twh-px-pick__toggle')!.addEventListener('click', () => {
      if ((state.get(slug) ?? 0) > 0) state.delete(slug); else state.set(slug, 1);
      render();
    });
    p.querySelector('[data-inc]')!.addEventListener('click', () => { state.set(slug, Math.min(max, (state.get(slug) ?? 1) + 1)); render(); });
    p.querySelector('[data-dec]')!.addEventListener('click', () => {
      const n = (state.get(slug) ?? 1) - 1;
      if (n <= 0) state.delete(slug); else state.set(slug, n);
      render();
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-plan-toggle]').forEach((b) => b.addEventListener('click', () => {
    const slug = b.dataset.planToggle!;
    if ((state.get(slug) ?? 0) > 0) state.delete(slug); else state.set(slug, 1);
    render();
  }));
  root.querySelector('[data-reset]')!.addEventListener('click', () => { state.clear(); render(); });
  render();
}
