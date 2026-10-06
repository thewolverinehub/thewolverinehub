/**
 * Drives every <form data-auth-form data-endpoint="/api/...">: submits JSON, shows server-side
 * field errors inline, redirects on success. Also handles the show/hide password buttons.
 *
 * Optional attributes:
 *   data-success="message"   show this (or the API's message) instead of redirecting
 *   data-method="PATCH"      HTTP method (default POST)
 */

function setStatus(form: HTMLFormElement, text: string, kind: 'error' | 'success' | 'info' | '') {
  const el = form.querySelector<HTMLElement>('[data-form-status]');
  if (!el) return;
  el.textContent = text;
  el.dataset.kind = kind;
  el.hidden = !text;
}

function clearErrors(form: HTMLFormElement) {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((e) => (e.textContent = ''));
  form.querySelectorAll('.twh-field--error').forEach((f) => f.classList.remove('twh-field--error'));
  setStatus(form, '', '');
}

function showFieldError(form: HTMLFormElement, field: string, message: string) {
  const slot = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
  if (!slot) return false;
  slot.textContent = message;
  slot.closest('.twh-field')?.classList.add('twh-field--error');
  form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
  return true;
}

function collect(form: HTMLFormElement): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  new FormData(form).forEach((v, k) => { if (typeof v === 'string') body[k] = v; });
  form.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((c) => { body[c.name] = c.checked; });
  return body;
}

export function initAuthForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-auth-form]').forEach((form) => {
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const idleLabel = submit?.textContent ?? '';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(form);
      if (!form.reportValidity()) return;

      if (submit) { submit.disabled = true; submit.textContent = 'Please wait…'; }
      try {
        const res = await fetch(form.dataset.endpoint!, {
          method: form.dataset.method ?? 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(collect(form)),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.ok !== false) {
          if (data.redirect && !form.dataset.success) {
            window.location.assign(data.redirect);
            return;
          }
          setStatus(form, form.dataset.success || data.message || 'Done.', 'success');
          if (form.dataset.reset === 'true') form.reset();
          if (form.dataset.hideOnSuccess === 'true') form.querySelectorAll<HTMLElement>('.twh-field, button[type="submit"]').forEach((el) => (el.hidden = true));
          if (data.redirect) window.setTimeout(() => window.location.assign(data.redirect), 900);
        } else {
          const message = data.message || 'Something went wrong. Please try again.';
          if (!(data.field && showFieldError(form, data.field, message))) setStatus(form, message, 'error');
        }
      } catch {
        setStatus(form, 'Network problem. Please check your connection and try again.', 'error');
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = idleLabel; }
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement?.querySelector<HTMLInputElement>('input');
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  // Password strength hint (register / reset / change password)
  document.querySelectorAll<HTMLInputElement>('input[data-strength]').forEach((input) => {
    const meter = document.querySelector<HTMLElement>(input.dataset.strength!);
    if (!meter) return;
    input.addEventListener('input', () => {
      const v = input.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Za-z]/.test(v) && /\d/.test(v)) score++;
      if (v.length >= 12) score++;
      if (/[^A-Za-z0-9]/.test(v) && v.length >= 8) score++;
      meter.dataset.score = String(v ? Math.max(1, score) : 0);
      meter.querySelector('span')!.textContent = ['', 'Weak', 'Okay', 'Good', 'Strong'][v ? Math.max(1, score) : 0];
    });
  });
}
