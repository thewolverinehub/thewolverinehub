import type { APIRoute } from 'astro';
import { fetchList } from '../../lib/strapi/client';

const MAX_QUERY_LENGTH = 100;
const MAX_RESULTS_PER_TYPE = 5;

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim().slice(0, MAX_QUERY_LENGTH);

  if (!q || q.length < 2) {
    return new Response(JSON.stringify({ results: {} }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoded = encodeURIComponent(q);

  try {
    const [classes, coaches, posts, faqs] = await Promise.allSettled([
      fetchList('classes', `filters[name][$containsi]=${encoded}&pagination[pageSize]=${MAX_RESULTS_PER_TYPE}`),
      fetchList('coaches', `filters[name][$containsi]=${encoded}&pagination[pageSize]=${MAX_RESULTS_PER_TYPE}`),
      fetchList('posts', `filters[title][$containsi]=${encoded}&pagination[pageSize]=${MAX_RESULTS_PER_TYPE}`),
      fetchList('faqs', `filters[question][$containsi]=${encoded}&pagination[pageSize]=${MAX_RESULTS_PER_TYPE}`),
    ]);

    const results = {
      classes: classes.status === 'fulfilled' ? (classes.value as { data: unknown[] }).data : [],
      coaches: coaches.status === 'fulfilled' ? (coaches.value as { data: unknown[] }).data : [],
      posts:   posts.status === 'fulfilled'   ? (posts.value as { data: unknown[] }).data : [],
      faqs:    faqs.status === 'fulfilled'    ? (faqs.value as { data: unknown[] }).data : [],
    };

    return new Response(JSON.stringify({ results, query: q }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  } catch {
    return new Response(JSON.stringify({ results: {}, error: 'Search unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
