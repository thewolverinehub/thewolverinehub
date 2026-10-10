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

export type EmailType = 'booking-confirmation' | 'booking-reminder' | 'booking-cancelled' | 'welcome' | 'password-reset' | 'contact-lead' | 'contact-ack' | 'other';

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
  type?: EmailType;
  /** e.g. the PDF receipt. Sent when a real provider is connected; always noted in the email log. */
  attachments?: { filename: string; content: Uint8Array; contentType?: string }[];
  replyTo?: string;
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
        replyTo: mail.replyTo,
        attachments: mail.attachments?.map((a) => ({ filename: a.filename, content: Buffer.from(a.content), contentType: a.contentType ?? 'application/pdf' })),
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
        body: mail.attachments?.length ? `${mail.text}\n\n[Attachment: ${mail.attachments.map((a) => a.filename).join(', ')}]` : mail.text,
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

export interface OrderMailData {
  name: string;
  email: string;
  orderId: string;
  total: number;
  items: BookingMailData[];
  receiptUrl: string;
}

/** One confirmation for the whole order — every session, the total and a receipt link (+ PDF attached). */
export function orderConfirmationEmail(o: OrderMailData): OutgoingEmail {
  const n = o.items.length;
  const first = o.items[0];
  const sessionsText = o.items.map((b, i) => `${i + 1}. ${b.className} - ${longDate(b.sessionDate)}, ${fmtTime(b.startTime)} - ${fmtTime(b.endTime)}${b.room ? ` (${b.room})` : ''} - ${money(b.amount)} - Ref ${b.reference}`).join('\n');
  const rowsHtml = o.items
    .map((b) => `<tr>
<td style="padding:12px 0;border-bottom:1px solid #2a2a30;vertical-align:top;">
<div style="font-size:16px;font-weight:700;color:#ffffff;">${esc(b.className)}</div>
<div style="font-size:13px;color:#a0a0a8;margin-top:3px;">${esc(longDate(b.sessionDate))} · ${esc(fmtTime(b.startTime))} – ${esc(fmtTime(b.endTime))}</div>
<div style="font-size:12px;color:#78787f;margin-top:2px;">${esc([b.room, b.coachNames ? 'Coach ' + b.coachNames : ''].filter(Boolean).join(' · '))} · Ref ${esc(b.reference)}</div>
</td>
<td style="padding:12px 0 12px 12px;border-bottom:1px solid #2a2a30;text-align:right;vertical-align:top;font-size:15px;font-weight:700;color:#ffc20e;white-space:nowrap;">${esc(money(b.amount))}</td></tr>`)
    .join('');
  return {
    to: o.email,
    type: 'booking-confirmation',
    subject: n === 1 ? `Booking confirmed — ${first.className}, ${longDate(first.sessionDate)}` : `Booking confirmed — ${n} sessions (${money(o.total)})`,
    text: `Hi ${o.name},\n\nYour booking${n > 1 ? 's are' : ' is'} confirmed${o.total > 0 ? ' and your payment was received' : ''}.\n\nOrder ${o.orderId}\n\n${sessionsText}\n\nTotal: ${money(o.total)}\n\nReceipt (PDF): ${o.receiptUrl}\nManage your bookings: ${SITE_URL()}/account/bookings\n\nSee you on the mat,\nThe Wolverine Hub`,
    html: layout(n === 1 ? "You're booked in" : `You're booked in — ${n} sessions`,
      `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(o.name)}, your booking${n > 1 ? 's are' : ' is'} confirmed${o.total > 0 ? ' and your payment was received' : ''}.</p>
<p style="margin:0 0 4px;font-size:12px;color:#78787f;letter-spacing:1px;text-transform:uppercase;">Order ${esc(o.orderId)}</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0;">${rowsHtml}
<tr><td style="padding:14px 0;font-size:13px;color:#a0a0a8;text-transform:uppercase;letter-spacing:1px;">Total</td><td style="padding:14px 0 14px 12px;text-align:right;font-size:20px;font-weight:900;color:#ffffff;">${esc(money(o.total))}</td></tr></table>
<p style="font-size:13px;color:#a0a0a8;line-height:1.6;">Your PDF receipt is attached. You can also <a href="${o.receiptUrl}" style="color:#ffc20e;">download it any time</a>. We will remind you the evening before each session. Please arrive 10 minutes early.</p>`,
      { label: 'View my bookings', href: `${SITE_URL()}/account/bookings` }),
  };
}

export interface LeadMailData {
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  prefer?: string;
  message?: string;
  receivedAt: string;
}

/** To the business: a new enquiry from the contact form. */
export function contactLeadEmail(to: string, l: LeadMailData): OutgoingEmail {
  const rows: [string, string][] = [
    ['Name', l.name], ['Email', l.email], ['Phone', l.phone || '-'], ['Topic', l.topic || '-'], ['Best way to reach', l.prefer || '-'], ['Received', l.receivedAt],
  ];
  const tableHtml = `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:8px 0;">${rows.map(([k, v]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #2a2a30;color:#a0a0a8;font-size:13px;width:140px;">${esc(k)}</td><td style="padding:8px 0;border-bottom:1px solid #2a2a30;color:#ffffff;font-size:15px;font-weight:600;">${esc(v)}</td></tr>`).join('')}</table>`;
  return {
    to,
    type: 'contact-lead',
    replyTo: l.email,
    subject: `New enquiry from ${l.name}${l.topic ? ` — ${l.topic}` : ''}`,
    text: `New website enquiry\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nMessage:\n${l.message || '(no message)'}\n\nReply directly to this email to answer ${l.name}.`,
    html: layout('New website enquiry', `${tableHtml}<p style="margin:16px 0 4px;font-size:12px;color:#78787f;letter-spacing:1px;text-transform:uppercase;">Message</p><p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#ffffff;">${esc(l.message || '(no message)')}</p><p style="font-size:13px;color:#a0a0a8;margin-top:18px;">Reply to this email to answer ${esc(l.name)} directly. The enquiry is also saved in Strapi under Leads.</p>`),
  };
}

/** To the visitor: "we got your message". */
export function contactAckEmail(l: LeadMailData): OutgoingEmail {
  return {
    to: l.email,
    type: 'contact-ack',
    subject: 'We got your message — The Wolverine Hub',
    text: `Hi ${l.name},\n\nThanks for getting in touch. We have your message and will reply${l.prefer ? ` by ${l.prefer.toLowerCase()}` : ''} within 24 hours on business days.\n\nYour message:\n${l.message || '(no message)'}\n\nThe Wolverine Hub`,
    html: layout('We got your message', `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;">Hi ${esc(l.name)}, thanks for getting in touch. We will reply${l.prefer ? ` by <strong style="color:#ffc20e;">${esc(l.prefer.toLowerCase())}</strong>` : ''} within 24 hours on business days.</p><p style="margin:16px 0 4px;font-size:12px;color:#78787f;letter-spacing:1px;text-transform:uppercase;">Your message</p><p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#ffffff;">${esc(l.message || '(no message)')}</p>`, { label: 'Browse classes', href: `${SITE_URL()}/classes` }),
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
