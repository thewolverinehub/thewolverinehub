import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';

export interface ReceiptItem {
  reference: string;
  className: string;
  sessionDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm[:ss]
  endTime: string;
  amount: number;
  status: string;
  room?: string;
  coachNames?: string;
}

export interface ReceiptData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  createdAt: string; // ISO
  paidAt?: string | null;
  status: string; // payment status
  provider: string;
  currency: string;
  total: number;
  refunded: number;
  items: ReceiptItem[];
}

const YELLOW = rgb(1, 0.76, 0.05);
const BLACK = rgb(0.04, 0.04, 0.045);
const INK = rgb(0.2, 0.2, 0.23);
const GREY = rgb(0.45, 0.45, 0.5);
const LINE = rgb(0.85, 0.85, 0.88);
const RED = rgb(0.84, 0.08, 0.1);

const money = (n: number, cur = 'LKR') => (n > 0 ? `${cur} ${Math.round(n).toLocaleString('en-US')}` : 'Free');
const fmtTime = (t: string) => {
  const [h, m] = String(t).split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(m ?? 0).padStart(2, '0')} ${ap}`;
};
const fmtDate = (d: string) => new Date(`${String(d).slice(0, 10)}T12:00:00+05:30`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo' });
const fmtStamp = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Colombo' }) + ' (Sri Lanka time)' : '—');
// pdf-lib's standard fonts only encode WinAnsi — strip anything else (e.g. fancy quotes / em dashes)
const safe = (s: string) => String(s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

export async function buildReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Receipt ${data.orderId}`);
  pdf.setAuthor('The Wolverine Hub');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595.28, H = 841.89, M = 44;
  let page = pdf.addPage([W, H]);
  let y = H;

  const text = (p: PDFPage, s: string, x: number, yy: number, size = 10, f: PDFFont = font, color = INK) => p.drawText(safe(s), { x, y: yy, size, font: f, color });
  const right = (p: PDFPage, s: string, xr: number, yy: number, size = 10, f: PDFFont = font, color = INK) => {
    const w = f.widthOfTextAtSize(safe(s), size);
    p.drawText(safe(s), { x: xr - w, y: yy, size, font: f, color });
  };

  // Header band
  page.drawRectangle({ x: 0, y: H - 96, width: W, height: 96, color: BLACK });
  page.drawRectangle({ x: 0, y: H - 100, width: W, height: 4, color: YELLOW });
  text(page, 'THE WOLVERINE HUB', M, H - 52, 20, bold, YELLOW);
  text(page, 'Booking receipt', M, H - 72, 11, font, rgb(0.85, 0.85, 0.88));
  right(page, data.status === 'refunded' ? 'REFUNDED' : data.status === 'paid' ? 'PAID' : data.status.toUpperCase(), W - M, H - 56, 16, bold, data.status === 'paid' ? YELLOW : rgb(1, 0.5, 0.5));
  y = H - 132;

  // Meta
  const meta: [string, string][] = [
    ['Order', data.orderId],
    ['Issued', fmtStamp(data.createdAt)],
    ['Paid', data.status === 'paid' || data.status === 'refunded' ? fmtStamp(data.paidAt) : '—'],
    ['Payment method', data.provider === 'preview' ? 'Test checkout (no real money moved)' : data.provider === 'free' ? 'Free booking' : 'Online payment'],
    ['Customer', `${data.customerName} <${data.customerEmail}>`],
  ];
  for (const [k, v] of meta) {
    text(page, k.toUpperCase(), M, y, 8, bold, GREY);
    text(page, v, M + 110, y, 10, font, INK);
    y -= 18;
  }
  y -= 10;

  // Table head
  const col = { cls: M, when: M + 190, ref: M + 345, amt: W - M };
  page.drawRectangle({ x: M - 6, y: y - 6, width: W - 2 * M + 12, height: 24, color: rgb(0.95, 0.95, 0.96) });
  text(page, 'SESSION', col.cls, y, 8, bold, GREY);
  text(page, 'DATE & TIME', col.when, y, 8, bold, GREY);
  text(page, 'REFERENCE', col.ref, y, 8, bold, GREY);
  right(page, 'AMOUNT', col.amt, y, 8, bold, GREY);
  y -= 28;

  for (const it of data.items) {
    if (y < 190) { page = pdf.addPage([W, H]); y = H - 60; }
    const cancelled = it.status === 'cancelled';
    const color = cancelled ? GREY : INK;
    text(page, it.className, col.cls, y, 11, bold, color);
    const sub = [it.room, it.coachNames].filter(Boolean).join(' · ');
    if (sub) text(page, sub, col.cls, y - 13, 8.5, font, GREY);
    text(page, fmtDate(it.sessionDate), col.when, y, 10, font, color);
    text(page, `${fmtTime(it.startTime)} - ${fmtTime(it.endTime)}`, col.when, y - 13, 9, font, GREY);
    text(page, it.reference, col.ref, y, 10, font, color);
    if (cancelled) text(page, 'Cancelled', col.ref, y - 13, 8.5, bold, RED);
    right(page, money(it.amount, data.currency), col.amt, y, 10.5, bold, color);
    y -= 38;
    page.drawLine({ start: { x: M - 6, y: y + 14 }, end: { x: W - M + 6, y: y + 14 }, thickness: 0.5, color: LINE });
  }

  // Totals
  y -= 6;
  right(page, 'Total', col.amt - 90, y, 10, font, GREY);
  right(page, money(data.total, data.currency), col.amt, y, 12, bold, BLACK);
  if (data.refunded > 0) {
    y -= 20;
    right(page, 'Refunded', col.amt - 90, y, 10, font, GREY);
    right(page, `- ${money(data.refunded, data.currency)}`, col.amt, y, 11, bold, RED);
    y -= 20;
    right(page, 'Net paid', col.amt - 90, y, 10, font, GREY);
    right(page, money(Math.max(0, data.total - data.refunded), data.currency), col.amt, y, 12, bold, BLACK);
  }

  // Footer notes
  const notes = [
    'Please arrive 10 minutes before your session. Bring water, a towel and training shoes.',
    'You can cancel free of charge up to 12 hours before a session from My Account > My Bookings.',
    data.provider === 'preview' ? 'This is a TEST receipt - the site is running in payment preview mode.' : 'Questions about this receipt? Reply to your confirmation email or contact us through the website.',
  ];
  let ny = 110;
  page.drawLine({ start: { x: M, y: ny + 18 }, end: { x: W - M, y: ny + 18 }, thickness: 0.5, color: LINE });
  for (const n of notes) { text(page, n, M, ny, 8.5, font, GREY); ny -= 13; }

  return pdf.save();
}
