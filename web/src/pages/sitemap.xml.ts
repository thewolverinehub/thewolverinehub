import type { APIRoute } from 'astro';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://thewolverinehub.com';
const INDEXING = import.meta.env.SITE_INDEXING === 'true';

function url(path: string, priority = '0.8', changefreq = 'weekly') {
  return `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  if (!INDEXING) {
    return new Response('', { status: 404 });
  }

  // Static routes — dynamic routes (classes/slug, posts/slug) populated from Strapi
  let dynamicUrls = '';

  try {
    const CMS = import.meta.env.CMS_INTERNAL_URL || 'http://localhost:1337';
    const token = import.meta.env.STRAPI_API_TOKEN;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const [classesRes, coachesRes, postsRes] = await Promise.allSettled([
      fetch(`${CMS}/api/classes?fields=slug&pagination[pageSize]=100`, { headers }).then((r) => r.json()),
      fetch(`${CMS}/api/coaches?fields=slug&pagination[pageSize]=50`, { headers }).then((r) => r.json()),
      fetch(`${CMS}/api/posts?fields=slug,publishedAt&pagination[pageSize]=100`, { headers }).then((r) => r.json()),
    ]);

    if (classesRes.status === 'fulfilled') {
      for (const c of (classesRes.value?.data ?? [])) {
        dynamicUrls += url(`/classes/${c.slug}`, '0.7');
      }
    }
    if (coachesRes.status === 'fulfilled') {
      for (const c of (coachesRes.value?.data ?? [])) {
        dynamicUrls += url(`/coaches/${c.slug}`, '0.6');
      }
    }
    if (postsRes.status === 'fulfilled') {
      for (const p of (postsRes.value?.data ?? [])) {
        dynamicUrls += url(`/journal/${p.slug}`, '0.6', 'monthly');
      }
    }
  } catch {
    // Sitemap without dynamic routes is still valid
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${url('/', '1.0', 'daily')}
${url('/classes', '0.9', 'weekly')}
${url('/schedule', '0.9', 'daily')}
${url('/coaches', '0.8', 'weekly')}
${url('/programs', '0.8', 'weekly')}
${url('/pricing', '0.8', 'weekly')}
${url('/gallery', '0.7', 'weekly')}
${url('/journal', '0.7', 'weekly')}
${url('/testimonials', '0.6', 'monthly')}
${url('/faqs', '0.6', 'monthly')}
${url('/contact', '0.7', 'monthly')}
${dynamicUrls}
</urlset>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600',
    },
  });
};
