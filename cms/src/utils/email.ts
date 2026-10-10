import type { Core } from '@strapi/strapi';
import { fmtTime, longDate } from './colombo';

/**
 * Email system.
 *
 * Every email is written to the "Email Log" collection (visible in the Strapi admin). While no
 * provider is connected (EMAIL_ENABLED is not "true") that is all that happens — nothing leaves the
 * server. To go live: configure a provider in config/plugins.ts (Strapi email plugin: nodemailer /
 * SendGrid / Resend…), set EMAIL_ENABLED=true and EMAIL_FROM — no other code changes needed.
 */

const SITE_URL = () => (process.env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/$/, '');

export type EmailType = 'booking-confirmation' | 'booking-reminder' | 'booking-cancelled' | 'welcome' | 'password-reset' | 'other';

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
  type?: EmailType;
}

export async function sendEmail(strapi: Core.Strapi, mail: OutgoingEmail): Promise<{ status: 'logged' | 'sent' | 'failed' }> {
  const db = strapi.db as any;
  let status: 'logged' | 'sent' | 'failed' = 'logged';
  let error: string | undefined;

  if (process.env.EMAIL_ENABLED === 'true') {
    try {
      await (strapi as any).plugin('email').service('email').send({
        to: mail.to,
        from: process.env.EMAIL_FROM || undefined,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      });
      status = 'sent';
    } catch (err: any) {
      status = 'failed';
      error = String(err?.message ?? err);
      strapi.log.error(`[email] send failed to ${mail.to}: ${error}`);
    }
  } else {
    strapi.log.info(`[email] (logged only) to=${mail.to} subject="${mail.subject}"`);
  }

  try {
    await db.query('api::email-log.email-log').create({
      data: {
        to: mail.to,
        subject: mail.subject,
        type: mail.type ?? 'other',
        body: mail.text,
        html: mail.html,
        status,
        error,
        sentAt: status === 'sent' ? new Date().toISOString() : null,
      },
    });
  } catch (err: any) {
    strapi.log.warn(`[email] could not write email log: ${err?.message ?? err}`);
  }
  return { status };
}

// ── Templates ────────────────────────────────────────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function layout(title: string, bodyHtml: string, cta?: { label: string; href: string }) {
  return `<!doctype html><html><body style="margin:0;background:#0a0a0b;font-family:Arial,Helvetica,sans-serif;color:#e2e2e5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#141418;border:1px solid #2a2a30;">
<tr><td style="padding:22px 28px;border-bottom:3px solid #ffc20e;"><span style="font-size:20px;font-weight:900;letter-spacing:2px;color:#ffc20e;">THE WOLVERINE HUB</span></td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:22px;color:#ffffff;text-transform:uppercase;letter-spacing:1px;">${esc(title)}</h1>
${bodyHtml}
${cta ? `<p style="margin:28px 0 0;"><a href="${cta.href}" style="display:inline-block;background:#ffc20e;color:#0a0a0b;font-weight:800;text-decoration:none;padding:13px 26px;letter-spacing:1px;text-transform:uppercase;font-size:13px;">${esc(cta.label)}</a></p>` : ''}
</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #2a2a30;font-size:12px;color:#78787f;">The Wolverine Hub · Colombo, Sri Lanka<br>You are receiving this because you have an account at ${SITE_URL().replace(/^https?:\/\//, '')}.</td></tr>
</table></td></tr></table></body></html>`;
}

export interface BookingMailData {
  name: string;
  email: string;
  reference: string;
  className: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  room?: string;
  coachNames?: string;
  /** set when a paid booking was cancelled and (test-mode) refunded */
  refundAmount?: number;
}

const money = (n: number) => (n > 0 ? `LKR ${n.toLocaleString('en-US')}` : 'Free');

function details(b: BookingMailData) {
  const rows: [string, string][] = [
    ['Class', b.className],
    ['Date', longDate(b.sessionDate)],
    ['Time', `${fmtTime(b.startTime)} – ${fmtTime(b.endTime)} (Sri Lanka time)`],
    ...(b.room ? ([['Where', b.room]] as [string, string][]) : []),
    ...(b.coachNames ? ([['Coach', b.coachNames]] as [string, string][]) : []),
    ['Amount', money(b.amount)],
    ['Reference', b.reference],
  ];
  return {
    html: `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0;">${rows
      .map(([k, v]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a30;color:#a0a0a8;font-size:13px;width:110px;">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a30;color:#ffffff;font-size:15px;font-weight:600;">${esc(v)}</td></tr>`)
      .join('')}</table>`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
  };
}

export function bookingConfirmationEmail(b: BookingMailData): OutgoingEmail {
  const d = details(b);
  return {
    to: b.email,
    type: 'booking-confirmation',
    subject: `Booking confirmed — ${b.className}, ${longDate(b.sessionDate)}`,
    text: `Hi ${b.name},\n\nYour booking is confirmed${b.amount > 0 ? ' and your payment was received' : ''}.\n\n${d.text}\n\nManage your bookings: ${SITE_URL()}/account/bookings\n\nSee you on the mat,\nThe Wolverine Hub`,
    html: layout('You\'re booked in', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(b.name)}, your booking is confirmed${b.amount > 0 ? ' and your payment was received' : ''}.</p>${d.html}<p style="font-size:13px;color:#a0a0a8;line-height:1.6;">We will send you a reminder the evening before your session. Please arrive 10 minutes early.</p>`, { label: 'View my bookings', href: `${SITE_URL()}/account/bookings` }),
  };
}

export function bookingReminderEmail(b: BookingMailData): OutgoingEmail {
  const d = details(b);
  return {
    to: b.email,
    type: 'booking-reminder',
    subject: `Reminder: ${b.className} tomorrow at ${fmtTime(b.startTime)}`,
    text: `Hi ${b.name},\n\nA reminder that you are booked in tomorrow.\n\n${d.text}\n\nCan't make it? Cancel from your account: ${SITE_URL()}/account/bookings\n\nThe Wolverine Hub`,
    html: layout('Training tomorrow', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(b.name)}, a quick reminder that you are booked in <strong style="color:#ffc20e;">tomorrow</strong>.</p>${d.html}<p style="font-size:13px;color:#a0a0a8;line-height:1.6;">Bring water, a towel and training shoes. Please arrive 10 minutes early.</p>`, { label: 'Manage booking', href: `${SITE_URL()}/account/bookings` }),
  };
}

export function bookingCancelledEmail(b: BookingMailData): OutgoingEmail {
  const d = details(b);
  return {
    to: b.email,
    type: 'booking-cancelled',
    subject: `Booking cancelled — ${b.className}, ${longDate(b.sessionDate)}`,
    text: `Hi ${b.name},\n\nYour booking has been cancelled.\n\n${d.text}\n\n${b.refundAmount ? `Refund: ${money(b.refundAmount)} has been refunded to your original payment method (test mode — no real money moved).` : 'No payment was taken for this session.'}\n\nThe Wolverine Hub`,
    html: layout('Booking cancelled', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(b.name)}, your booking has been cancelled.</p>${d.html}<p style="font-size:13px;color:#a0a0a8;line-height:1.6;">${b.refundAmount ? `<b style="color:#ffc20e;">${esc(money(b.refundAmount))}</b> has been refunded to your original payment method <i>(test mode — no real money moved)</i>.` : 'No payment was taken for this session.'}</p>`, { label: 'Book another class', href: `${SITE_URL()}/schedule` }),
  };
}

export function welcomeEmail(name: string, email: string): OutgoingEmail {
  return {
    to: email,
    type: 'welcome',
    subject: 'Welcome to The Wolverine Hub',
    text: `Hi ${name},\n\nYour account is ready. Browse classes and book your first session: ${SITE_URL()}/schedule\n\nThe Wolverine Hub`,
    html: layout('Welcome to the pack', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(name)}, your account is ready. Pick a class from the timetable, book a slot and pay online — it takes a minute.</p>`, { label: 'See the schedule', href: `${SITE_URL()}/schedule` }),
  };
}

export function passwordResetEmail(name: string, email: string, link: string): OutgoingEmail {
  return {
    to: email,
    type: 'password-reset',
    subject: 'Reset your password',
    text: `Hi ${name},\n\nUse this link to choose a new password (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, ignore this email.`,
    html: layout('Reset your password', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(name)}, use the button below to choose a new password. The link is valid for 1 hour.</p><p style="font-size:13px;color:#a0a0a8;">If you didn't ask for this, you can ignore this email.</p>`, { label: 'Choose a new password', href: link }),
  };
}
