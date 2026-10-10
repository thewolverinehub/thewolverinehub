import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid request body.' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    });
  }

  const name    = String(body.name    ?? '').trim();
  const email   = String(body.email   ?? '').trim();
  const phone   = String(body.phone   ?? '').trim();
  const message = String(body.message ?? '').trim();
  const topic   = String(body.topic ?? '').trim().slice(0, 80);
  const preferredContact = String(body.preferredContact ?? '').trim().slice(0, 40);

  if (!name || !email) {
    return new Response(JSON.stringify({ message: 'Name and email are required.' }), {
      status: 422, headers: { 'Content-Type': 'application/json' },
    });
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return new Response(JSON.stringify({ message: 'Please enter a valid email address.' }), {
      status: 422, headers: { 'Content-Type': 'application/json' },
    });
  }

  const CMS_URL   = import.meta.env.CMS_INTERNAL_URL || import.meta.env.CMS_PUBLIC_URL || 'http://localhost:1337';
  const API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

  try {
    const res = await fetch(`${CMS_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        data: {
          formKey: 'contact',
          name,
          email,
          phone: phone || undefined,
          message: message || undefined,
          topic: topic || undefined,
          preferredContact: preferredContact || undefined,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[contact] Strapi error:', res.status, err);
      return new Response(JSON.stringify({ message: 'Could not save your message. Please try again.' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[contact] Network error:', err);
    return new Response(JSON.stringify({ message: 'Server error. Please try again later.' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
