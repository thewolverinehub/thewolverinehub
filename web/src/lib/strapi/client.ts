import type { StrapiListResponse, StrapiSingleResponse } from './types';

const CMS_URL = import.meta.env.CMS_INTERNAL_URL || import.meta.env.CMS_PUBLIC_URL || 'http://localhost:1337';
const API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

type FetchOptions = {
  tags?: string[];
  revalidate?: number;
};

async function strapiRequest<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = `${CMS_URL}/api${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const res = await fetch(url, {
    headers,
    // Astro fetch cache hint
    ...(options.revalidate !== undefined && {
      next: { revalidate: options.revalidate, tags: options.tags },
    }),
  });

  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status} ${res.statusText} — ${url}`);
  }

  return res.json() as Promise<T>;
}

/* ── Public API ─────────────────────────────────────────── */

export async function fetchSingle<T>(
  contentType: string,
  params = '',
  options: FetchOptions = {}
): Promise<T> {
  const res = await strapiRequest<StrapiSingleResponse<T>>(
    `/${contentType}?populate=deep${params ? `&${params}` : ''}`,
    options
  );
  return res.data;
}

export async function fetchList<T>(
  contentType: string,
  params = '',
  options: FetchOptions = {}
): Promise<T[]> {
  const res = await strapiRequest<StrapiListResponse<T>>(
    `/${contentType}?populate=deep${params ? `&${params}` : ''}`,
    options
  );
  return res.data;
}

export async function fetchOne<T>(
  contentType: string,
  slug: string,
  params = '',
  options: FetchOptions = {}
): Promise<T | null> {
  const res = await strapiRequest<StrapiListResponse<T>>(
    `/${contentType}?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=deep${params ? `&${params}` : ''}`,
    options
  );
  return res.data[0] ?? null;
}
