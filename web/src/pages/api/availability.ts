import type { APIRoute } from 'astro';
import { seatsTaken } from '../../lib/auth/cms';
import { fail, json } from '../../lib/auth/http';

export const prerender = false;

/** GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD → { taken: { "slotId|date": seats } } */
export const GET: APIRoute = async ({ url }) => {
  const from = url.searchParams.get('from') ?? '';
  const to = url.searchParams.get('to') ?? '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return fail(422, 'from and to must be YYYY-MM-DD.');
  return json({ taken: await seatsTaken(from, to) }, 200, { 'Cache-Control': 'public, max-age=10' });
};
