import gsap from 'gsap';

// Clip-path states — matches the slash menu diagonal aesthetic
const HIDDEN_R = 'polygon(115% 0, 125% 0, 125% 110%, 115% 110%)';
const COVERING = 'polygon(20% 0, 115% 0, 115% 110%, -10% 110%)';
const HIDDEN_L = 'polygon(-95% 0, -85% 0, -85% 110%, -95% 110%)';

let isNavigating = false;

function getOrCreateOverlay(): { overlay: HTMLElement; panels: HTMLElement[] } {
  let overlay = document.getElementById('twh-pt') as HTMLElement | null;
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'twh-pt';
    overlay.className = 'twh-pt';
    overlay.innerHTML = [
      '<div class="twh-pt__panel twh-pt__panel--1"></div>',
      '<div class="twh-pt__panel twh-pt__panel--2"></div>',
      '<div class="twh-pt__panel twh-pt__panel--3"></div>',
    ].join('');
    document.body.appendChild(overlay);
  }
  return {
    overlay,
    panels: Array.from(overlay.querySelectorAll<HTMLElement>('.twh-pt__panel')),
  };
}

export function initPageTransition(): void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { overlay, panels } = getOrCreateOverlay();

  if (reducedMotion) {
    gsap.set(panels, { clipPath: HIDDEN_L });
    return;
  }

  // ── Page enter: panels start covering → sweep left to reveal ──
  gsap.set(panels, { clipPath: COVERING });
  gsap.to(panels, {
    clipPath: HIDDEN_L,
    duration: 0.6,
    ease: 'power3.inOut',
    stagger: 0.08,
    delay: 0.05,
    onComplete: () => overlay.classList.remove('is-active'),
  });

  // ── Intercept same-origin link clicks for exit animation ──────
  document.addEventListener('click', (e) => {
    const anchor = (e.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    // Lightbox triggers and opt-outs handle their own click (no page exit animation)
    if (anchor.hasAttribute('data-lightbox') || anchor.hasAttribute('data-no-transition')) return;

    const href = anchor.getAttribute('href') ?? '';
    if (
      !href ||
      anchor.target === '_blank' ||
      anchor.hasAttribute('download') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      (href.startsWith('http') && !href.startsWith(window.location.origin))
    ) return;

    // Skip if navigating to the current page
    try {
      const target = new URL(href, window.location.href);
      if (
        target.pathname === window.location.pathname &&
        target.search === window.location.search
      ) return;
    } catch { return; }

    if (isNavigating) { e.preventDefault(); return; }
    isNavigating = true;
    e.preventDefault();

    // Instantly close the slash menu if open (avoid competing animations)
    const menu = document.getElementById('main-menu');
    if (menu?.classList.contains('is-open')) {
      menu.style.transition = 'none';
      menu.style.visibility = 'hidden';
      document.body.classList.remove('menu-is-open');
      document.body.style.overflow = '';
    }

    overlay.classList.add('is-active');

    // Exit: panels sweep in from right, then navigate
    gsap.set(panels, { clipPath: HIDDEN_R });
    gsap.to(panels, {
      clipPath: COVERING,
      duration: 0.5,
      ease: 'power3.inOut',
      stagger: 0.08,
      onComplete: () => { window.location.href = href; },
    });
  }, true); // capture phase — fires before menu link listeners
}
