/** Dashboard interactions: two-step "Cancel booking" buttons. */

export function initAccount() {
  document.querySelectorAll<HTMLButtonElement>('[data-cancel-booking]').forEach((btn) => {
    let armedTimer: number | undefined;
    const label = btn.textContent ?? 'Cancel';

    btn.addEventListener('click', async () => {
      // first click arms the button, second click (within 4 s) confirms
      if (btn.dataset.armed !== 'true') {
        btn.dataset.armed = 'true';
        btn.textContent = 'Tap again to confirm';
        btn.classList.add('is-armed');
        armedTimer = window.setTimeout(() => {
          btn.dataset.armed = 'false';
          btn.textContent = label;
          btn.classList.remove('is-armed');
        }, 4000);
        return;
      }
      window.clearTimeout(armedTimer);
      btn.disabled = true;
      btn.textContent = 'Cancelling…';
      try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(btn.dataset.cancelBooking!)}/cancel`, { method: 'POST' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          window.location.assign('/account/bookings?cancelled=1');
          return;
        }
        const msg = btn.closest('[data-booking-row]')?.querySelector<HTMLElement>('[data-row-error]');
        if (msg) { msg.textContent = data.message || 'Could not cancel this booking.'; msg.hidden = false; }
        btn.disabled = false;
        btn.dataset.armed = 'false';
        btn.textContent = label;
        btn.classList.remove('is-armed');
      } catch {
        btn.disabled = false;
        btn.textContent = label;
      }
    });
  });
}
