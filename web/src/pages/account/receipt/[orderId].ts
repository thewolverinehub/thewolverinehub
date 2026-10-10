import type { APIRoute } from 'astro';
import { fetchReceipt } from '../../../lib/auth/cms';

export const prerender = false;

/** GET /account/receipt/:orderId → the PDF receipt for one of the signed-in member's orders. */
export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.session) return new Response('Please sign in.', { status: 401 });
  const receipt = await fetchReceipt(locals.session.uid, String(params.orderId)).catch(() => null);
  if (!receipt) return new Response('Receipt not found.', { status: 404 });
  return new Response(receipt.bytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${receipt.name}"`,
      'Cache-Control': 'private, no-store',
    },
  });
};
