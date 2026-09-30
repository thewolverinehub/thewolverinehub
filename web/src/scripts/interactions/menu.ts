/**
 * Menu controller — handles open/close, focus trap, keyboard nav,
 * scroll progress, and header hide/show on scroll.
 * Works with all three menu variants (SlashMenu, Reveal, Slide).
 */

export function initMenu() {
  const trigger = document.getElementById('menu-trigger') as HTMLButtonElement | null;
  const mobileTrigger = document.getElementById('mobile-menu-trigger') as HTMLButtonElement | null;
  const header = document.getElementById('site-header') as HTMLElement | null;
  const progressBar = document.getElementById('scroll-progress') as HTMLElement | null;

  if (!trigger) return;

  const menuId = trigger.getAttribute('aria-controls') ?? 'main-menu';
  const menu = document.getElementById(menuId) as HTMLElement | null;
  if (!menu) return;

  // Slide menu backdrop
  const backdrop = document.getElementById('slide-backdrop') as HTMLElement | null;

  let isOpen = false;
  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  // ── Open / close ───────────────────────────────────────────
  function openMenu() {
    isOpen = true;
    menu!.classList.add('is-open');
    menu!.setAttribute('aria-hidden', 'false');
    trigger!.setAttribute('aria-expanded', 'true');
    mobileTrigger?.setAttribute('aria-expanded', 'true');
    backdrop?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    // Move focus into menu after transition
    setTimeout(() => {
      const firstLink = menu!.querySelector<HTMLElement>('a, button');
      firstLink?.focus();
    }, 400);
  }

  function closeMenu() {
    isOpen = false;
    menu!.classList.remove('is-open');
    menu!.setAttribute('aria-hidden', 'true');
    trigger!.setAttribute('aria-expanded', 'false');
    mobileTrigger?.setAttribute('aria-expanded', 'false');
    backdrop?.classList.remove('is-visible');
    document.body.style.overflow = '';
    trigger!.focus();
  }

  function toggleMenu() {
    if (isOpen) { closeMenu(); } else { openMenu(); }
  }

  trigger.addEventListener('click', toggleMenu);
  mobileTrigger?.addEventListener('click', toggleMenu);
  backdrop?.addEventListener('click', closeMenu);

  // Close buttons inside menu
  menu.querySelectorAll('[data-menu-close]').forEach((btn) => {
    btn.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close when any menu link is clicked (SPA navigation)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Focus trap
  menu.addEventListener('keydown', (e) => {
    if (!isOpen || e.key !== 'Tab') return;
    const focusable = Array.from(
      menu.querySelectorAll<HTMLElement>('a, button, input, [tabindex]:not([tabindex="-1"])')
    ).filter((el) => !el.closest('[aria-hidden="true"]'));

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // ── Header scroll behaviour ────────────────────────────────
  if (header) {
    function handleScroll() {
      if (scrollTicking) return;
      scrollTicking = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const scrolled = currentY > 80;

        header!.classList.toggle('is-scrolled', scrolled);
        header!.classList.toggle('is-hidden', currentY > lastScrollY && currentY > 200 && !isOpen);

        lastScrollY = currentY;

        // Scroll progress
        if (progressBar) {
          const total = document.documentElement.scrollHeight - window.innerHeight;
          const pct = total > 0 ? (currentY / total) * 100 : 0;
          progressBar.style.width = `${pct}%`;
        }

        scrollTicking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // ── Slash Menu: preview image on hover ─────────────────────
  const previewContainer = document.getElementById('menu-preview');
  if (previewContainer) {
    menu.querySelectorAll<HTMLElement>('[data-preview-image], [data-preview-video]').forEach((link) => {
      link.addEventListener('mouseenter', () => {
        const imgUrl = link.dataset.previewImage;
        const vidUrl = link.dataset.previewVideo;

        previewContainer.innerHTML = '';
        if (vidUrl) {
          const vid = document.createElement('video');
          vid.src = vidUrl;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.autoplay = true;
          vid.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
          previewContainer.appendChild(vid);
        } else if (imgUrl) {
          const img = document.createElement('img');
          img.src = imgUrl;
          img.alt = '';
          img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
          previewContainer.appendChild(img);
        }
      });
    });
  }
}
