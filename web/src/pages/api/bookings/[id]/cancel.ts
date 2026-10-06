import type { APIRoute } from 'astro';
import { cmsFailure, fail, json } from '../../../../lib/auth/http';
import { cancelBooking } from '../../../../lib/auth/cms';

export const prerender = false;

export const POST: APIRoute = async ({ params, locals }) => {
  if (!locals.session) return fail(401, 'Please sign in.');
  try {
    await cancelBooking(locals.session.uid, String(params.id));
    return json({ ok: true });
  } catch (err) {
    return cmsFailure(err, 'We could not cancel that booking. Please try again.');
  }
};
