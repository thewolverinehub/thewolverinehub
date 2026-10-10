/** Contact page: open-now status, today's hours, copy buttons, topic picker, form submit. */
import { getColomboNow } from '../../lib/utils/colombo';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** "Monday – Friday" | "Saturday" | "Mon-Fri" → set of weekday indexes (0 = Sunday) */
function parseDays(label: string): Set<number> {
  const found = DAY_NAMES.map((d, i) => ({ i, at: label.toLowerCase().search(new RegExp(`\\b${d.slice(0, 3)}`)) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at);
  const out = new Set<number>();
  if (found.length === 0) return out;
  if (found.length === 1) { out.add(found[0].i); return out; }
  const start = found[0].i;
  const end = found[1].i;
  for (let d = start; ; d = (d + 1) % 7) { out.add(d); if (d === end) break; }
  return out;
}

/** "06:00 AM – 10:00 PM" → [minutesOpen, minutesClose] */
function parseRange(text: string): [number, number] | null {
  const m = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/gi)].filter((x) => x[0].trim());
  if (m.length < 2) return null;
  const toMin = (x: RegExpMatchArray, fallbackPm?: boolean) => {
    let h = Number(x[1]);
    const min = Number(x[2] ?? 0);
    const ap = (x[3] ?? '').toLowerCase();
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (!ap && fallbackPm && h < 12) h += 12;
    return h * 60 + min;
  };
  const a = toMin(m[0]);
  const b = toMin(m[1], !m[1][3] ? false : undefined);
  return [a, b];
}

const fmtTime = (min: number) => {
  const h24 = Math.floor(min / 60) % 24;
  const m = min % 60;
  const ap = h24 >= 12 ? 'PM' : 'AM';
  const h = h24 % 12 || 12;
  return `${h}${m ? `:${String(m).padStart(2, '0')}` : ''} ${ap}`;
};

function initHours() {
  const box = document.querySelector<HTMLElement>('[data-hours]');
  const status = document.getElementById('open-status');
  const text = document.getElementById('open-status-text');
  if (!box || !status || !text) return;
  let hours: Record<string, string> = {};
  try { hours = JSON.parse(box.dataset.hours ?? '{}'); } catch { /* ignore */ }

  const rows = Array.from(box.querySelectorAll<HTMLElement>('.twh-ct-hours__row'));
  const entries = Object.entries(hours).map(([label, t]) => ({ days: parseDays(label), range: parseRange(String(t)), label }));

  const update = () => {
    const now = getColomboNow();
    const dow = new Date(`${now.dateISO}T12:00:00+05:30`).getUTCDay();
    const minutes = now.minutes;
    const today = entries.find((e) => e.days.has(dow));
    rows.forEach((r) => r.classList.toggle('is-today', Boolean(today && r.dataset.day === today.label)));
    if (!today?.range) { status.dataset.state = 'unknown'; text.textContent = 'See opening hours below'; return; }
    const [open, close] = today.range;
    if (minutes >= open && minutes < close) {
      status.dataset.state = 'open';
      text.textContent = `Open now · closes at ${fmtTime(close)}`;
    } else if (minutes < open) {
      status.dataset.state = 'closed';
      text.textContent = `Closed · opens today at ${fmtTime(open)}`;
    } else {
      status.dataset.state = 'closed';
      text.textContent = 'Closed for today · see you tomorrow';
    }
  };
  update();
  window.setInterval(update, 30_000);
}

function initCopy() {
  document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const value = btn.dataset.copy ?? '';
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = value; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch { /* ignore */ }
        ta.remove();
      }
      const label = btn.textContent;
      btn.textContent = 'Copied ✓';
      btn.classList.add('is-done');
      window.setTimeout(() => { btn.textContent = label; btn.classList.remove('is-done'); }, 1600);
    });
  });
}

function initForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  if (!form) return;
  const status = document.getElementById('contact-status')!;
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const message = document.getElementById('cf-message') as HTMLTextAreaElement;
  const count = document.getElementById('cf-count')!;
  const done = document.getElementById('contact-done')!;
  const doneText = document.getElementById('contact-done-text')!;
  const topics = document.querySelectorAll<HTMLInputElement>('input[name="topic"]');
  let lastStarter = '';

  const applyTopic = (t: HTMLInputElement) => {
    message.placeholder = t.dataset.placeholder ?? message.placeholder;
    const starter = t.dataset.starter ?? '';
    // only replace the message if the visitor has not typed their own text yet
    if (!message.value.trim() || message.value === lastStarter) { message.value = starter; lastStarter = starter; count.textContent = String(message.value.length); }
  };
  topics.forEach((t) => t.addEventListener('change', () => applyTopic(t)));
  const first = Array.from(topics).find((t) => t.checked);
  if (first) { message.placeholder = first.dataset.placeholder ?? message.placeholder; }

  message.addEventListener('input', () => { count.textContent = String(message.value.length); });

  const show = (state: 'success' | 'error', msg: string) => { status.dataset.state = state; status.textContent = msg; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    show('error', '');
    status.dataset.state = '';
    if ((form.querySelector<HTMLInputElement>('[name="website"]'))?.value) return; // honeypot

    const data = new FormData(form);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const phone = String(data.get('phone') ?? '').trim();
    const topic = topics.length ? (Array.from(topics).find((t) => t.checked)?.closest('label')?.querySelector('b')?.textContent ?? '') : '';
    const prefer = String(data.get('prefer') ?? '');
    const body = String(data.get('message') ?? '').trim();

    if (!name || !email) { show('error', 'Please fill in your name and email.'); (name ? form.querySelector<HTMLInputElement>('#cf-email') : form.querySelector<HTMLInputElement>('#cf-name'))?.focus(); return; }

    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, message: body, topic, preferredContact: prefer }),
      });
      if (res.ok) {
        doneText.textContent = `Thanks ${name.split(' ')[0]} — we'll reply by ${prefer.toLowerCase()} within 24 hours.`;
        form.hidden = true;
        document.querySelector<HTMLElement>('.twh-ct-topics')!.hidden = true;
        done.hidden = false;
        done.classList.add('is-in');
        form.reset();
        lastStarter = '';
        count.textContent = '0';
      } else {
        const json = await res.json().catch(() => ({}));
        show('error', json.message ?? 'Something went wrong. Please try again.');
      }
    } catch {
      show('error', 'Network error. Please check your connection and try again.');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Send message';
    }
  });

  document.getElementById('contact-again')?.addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
    document.querySelector<HTMLElement>('.twh-ct-topics')!.hidden = false;
    if (first) { first.checked = true; applyTopic(first); }
  });
}

export function initContact() {
  initHours();
  initCopy();
  initForm();
}
