import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const indexing = import.meta.env.SITE_INDEXING === 'true';
  const siteUrl = import.meta.env.PUBLIC_SITE_URL || site?.href || 'https://thewolverinehub.com';

  const content = indexing
    ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
    : `User-agent: *\nDisallow: /\n`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
