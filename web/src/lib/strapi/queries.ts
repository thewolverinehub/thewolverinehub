import { fetchSingle, fetchList, fetchOne } from './client';
import type {
  StrapiGlobal, StrapiHeader, StrapiFooter, StrapiUiStrings,
  StrapiClass, StrapiCoach, StrapiScheduleSlot,
  StrapiTestimonial, StrapiFaq, StrapiFaqCategory,
  StrapiPost, StrapiGalleryItem, StrapiRedirect,
  StrapiPage,
} from './types';
import { cache } from '../cache';

const TTL = 600; // 10 minutes

/* ── Single types ────────────────────────────────────────── */

export const getGlobal = () =>
  cache('global', () => fetchSingle<StrapiGlobal>('global'), TTL);

export const getHeader = () =>
  cache('header', () => fetchSingle<StrapiHeader>(
    'header',
    'populate[menuItems][populate]=*&populate[primaryCta]=*',
  ), TTL);

export const getFooter = () =>
  cache('footer', () => fetchSingle<StrapiFooter>(
    'footer',
    'populate[columns][populate]=*&populate[legalLinks]=*',
  ), TTL);

export const getUiStrings = () =>
  cache('ui-strings', () => fetchSingle<StrapiUiStrings>('ui-strings'), TTL);

export const getPageBySlug = (slug: string) =>
  cache(`page:${slug}`, () => fetchOne<StrapiPage>('pages', slug), TTL);

/* ── Collections ─────────────────────────────────────────── */

export const getClasses = () =>
  cache('classes', () =>
    fetchList<StrapiClass>('classes', 'sort=sortOrder:asc&pagination[pageSize]=100'),
    TTL
  );

export const getClassBySlug = (slug: string) =>
  cache(`class:${slug}`, () => fetchOne<StrapiClass>('classes', slug), TTL);

export const getCoaches = () =>
  cache('coaches', () =>
    fetchList<StrapiCoach>('coaches', 'sort=sortOrder:asc&pagination[pageSize]=50'),
    TTL
  );

export const getCoachBySlug = (slug: string) =>
  cache(`coach:${slug}`, () => fetchOne<StrapiCoach>('coaches', slug), TTL);

export const getScheduleSlots = () =>
  cache('schedule-slots', () =>
    fetchList<StrapiScheduleSlot>('schedule-slots', 'filters[isActive][$eq]=true&pagination[pageSize]=200'),
    TTL
  );

export const getTestimonials = () =>
  cache('testimonials', () =>
    fetchList<StrapiTestimonial>('testimonials', 'pagination[pageSize]=50'),
    TTL
  );

export const getFaqCategories = () =>
  cache('faq-categories', () =>
    fetchList<StrapiFaqCategory>('faq-categories', 'sort=sortOrder:asc'),
    TTL
  );

export const getFaqs = () =>
  cache('faqs', () =>
    fetchList<StrapiFaq>('faqs', 'sort=sortOrder:asc&pagination[pageSize]=100'),
    TTL
  );

export const getPosts = (page = 1, pageSize = 12) =>
  cache(`posts:${page}:${pageSize}`, () =>
    fetchList<StrapiPost>('posts', `sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${pageSize}`),
    TTL
  );

export const getPostBySlug = (slug: string) =>
  cache(`post:${slug}`, () => fetchOne<StrapiPost>('posts', slug), TTL);

export const getGalleryItems = () =>
  cache('gallery-items', () =>
    fetchList<StrapiGalleryItem>('gallery-items', 'sort=sortOrder:asc&pagination[pageSize]=100'),
    TTL
  );

export const getRedirects = () =>
  cache('redirects', () =>
    fetchList<StrapiRedirect>('redirects', 'filters[isActive][$eq]=true&pagination[pageSize]=500'),
    60 * 60 // 1 hour — redirects change rarely
  );
