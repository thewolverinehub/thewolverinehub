/** Dashboard interactions: "Cancel booking" opens a confirmation dialog (with the refund note). */

export function initAccount() {
  const dialog = document.getElementById('cancel-dialog') as HTMLDialogElement | null;
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-cancel-booking]');
  if (!dialog || buttons.length === 0) return;

  const what = dialog.querySelector<HTMLElement>('[data-dlg-what]')!;
  const text = dialog.querySelector<HTMLElement>('[data-dlg-text]')!;
  const err = dialog.querySelector<HTMLElement>('[data-dlg-error]')!;
  const confirm = dialog.querySelector<HTMLButtonElement>('[data-dlg-confirm]')!;
  const keep = dialog.querySelector<HTMLButtonElement>('[data-dlg-keep]')!;
  let current: HTMLButtonElement | null = null;

  const close = () => { if (dialog.open) dialog.close(); current?.focus(); current = null; };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      current = btn;
      what.textContent = `${btn.dataset.cancelTitle ?? 'Class'} — ${btn.dataset.cancelWhen ?? ''}`;
      const refund = btn.dataset.cancelRefund;
      text.textContent = refund
        ? `You paid ${refund} for this session. It will be refunded to your original payment method (test mode: no real money moves). You can cancel free of charge up to 12 hours before the session.`
        : 'Your seat will be released so someone else can take it. You can cancel free of charge up to 12 hours before the session.';
      err.hidden = true;
      confirm.disabled = false;
      keep.disabled = false;
      confirm.textContent = 'Yes, cancel it';
      dialog.showModal();
    });
  });

  keep.addEventListener('click', (e) => { e.preventDefault(); close(); });
  dialog.addEventListener('cancel', () => { current?.focus(); });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); }); // backdrop click

  confirm.addEventListener('click', async () => {
    if (!current) return;
    confirm.disabled = true;
    keep.disabled = true;
    confirm.textContent = 'Cancelling…';
    err.hidden = true;
    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(current.dataset.cancelBooking!)}/cancel`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        const refund = current.dataset.cancelRefund;
        window.location.assign(`/account/bookings?cancelled=1${refund ? `&refund=${encodeURIComponent(refund)}` : ''}`);
        return;
      }
      err.textContent = data.message || 'We could not cancel this booking. Please try again.';
    } catch {
      err.textContent = 'Network problem. Please check your connection and try again.';
    }
    err.hidden = false;
    confirm.disabled = false;
    keep.disabled = false;
    confirm.textContent = 'Try again';
  });
}
