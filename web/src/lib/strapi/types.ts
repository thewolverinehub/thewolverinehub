/* Strapi v5 response shapes — flat format (no data.attributes wrapper) */

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number | null;
  height: number | null;
  mime: string;
  size: number;
  name: string;
  formats?: Record<string, { url: string; width: number; height: number }> | null;
}

export interface StrapiSeo {
  metaTitle: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaRobots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: StrapiMedia;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: Record<string, unknown>;
}

export interface StrapiCtaButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  openInNewTab: boolean;
}

export interface StrapiLink {
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface StrapiMenuItem {
  label: string;
  href: string;
  indexNumber?: string;
  description?: string;
  previewImage?: StrapiMedia;
  previewVideo?: StrapiMedia;
  subItems?: StrapiLink[];
}

export interface StrapiFooterColumn {
  heading: string;
  links: StrapiLink[];
}

/* ── Single types ─────────────────────────────────────────── */

export interface StrapiGlobal {
  documentId: string;
  siteName: string;
  siteTagline?: string;
  logoLight?: StrapiMedia;
  logoDark?: StrapiMedia;
  logoMonogram?: StrapiMedia;
  favicon?: StrapiMedia;
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  mapLink?: string;
  hoursJson?: Record<string, string>;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  companyNumber?: string;
  twitterHandle?: string;
  defaultSeo?: StrapiSeo;
  experienceIntroAnimation: boolean;
  experienceWebgl: boolean;
  experienceSmoothScroll: boolean;
  experienceCustomCursor: boolean;
  experienceSoundDefault: boolean;
  experienceMotionIntensity: 'full' | 'lite' | 'minimal';
}

export interface StrapiHeader {
  documentId: string;
  menuItems: StrapiMenuItem[];
  primaryCta?: StrapiCtaButton;
  announcementBarEnabled: boolean;
  announcementBarText?: string;
  announcementBarLink?: string;
  announcementBarColour: 'yellow' | 'red' | 'blue';
}

export interface StrapiFooter {
  documentId: string;
  columns: StrapiFooterColumn[];
  newsletterEnabled: boolean;
  newsletterHeading?: string;
  newsletterSubheading?: string;
  legalLinks: StrapiLink[];
  copyrightText?: string;
  wordmarkText: string;
}

export interface StrapiUiStrings {
  documentId: string;
  skipLinkLabel: string;
  searchPlaceholder: string;
  filterNoResults: string;
  loadMoreLabel: string;
  bookNowLabel: string;
  viewDetailsLabel: string;
  fullBadge: string;
  spotsLeftTemplate: string;
  introSkipLabel: string;
  cookieNotice?: string;
  formSuccessDefault: string;
  formErrorDefault: string;
  notFoundHeading: string;
  notFoundBody?: string;
  errorHeading: string;
  errorBody?: string;
}

/* ── Section components ───────────────────────────────────── */

export interface StrapiPageHeroSection {
  __component: 'sections.page-hero';
  eyebrow?: string;
  heading: string;
  subheading?: string;
}

export interface StrapiHeroSection {
  __component: 'sections.hero-video';
  headline: string;
  subheadline?: string;
  video?: StrapiMedia;
  poster?: StrapiMedia;
  primaryCta?: StrapiCtaButton;
  secondaryCta?: StrapiCtaButton;
  visible: boolean;
  anchorId?: string;
}

export interface StrapiStatItem {
  number: string;
  label: string;
}

export interface StrapiStatCountersSection {
  __component: 'sections.stat-counters';
  stats: StrapiStatItem[];
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiMarqueeSection {
  __component: 'sections.marquee';
  items: string[] | Array<{ text: string }>;
  speed?: 'slow' | 'normal' | 'fast';
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiClassRailSection {
  __component: 'sections.class-rail';
  heading?: string;
  cta?: StrapiCtaButton;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiMediaComponent {
  image?: StrapiMedia;
  video?: StrapiMedia;
}

export interface StrapiFeatureSplitSection {
  __component: 'sections.feature-split';
  eyebrow?: string;
  heading: string;
  body?: unknown; // blocks
  media?: StrapiMediaComponent;
  cta?: StrapiCtaButton;
  imagePosition?: 'left' | 'right';
  backgroundToken?: string;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiCoachCarouselSection {
  __component: 'sections.coach-carousel';
  heading?: string;
  cta?: StrapiCtaButton;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiCoachSpotlightSection {
  __component: 'sections.coach-spotlight';
  heading?: string;
  cta?: StrapiCtaButton;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiOurStoryChapter {
  year: string;
  title: string;
  text: string;
}

export interface StrapiOurStorySection {
  __component: 'sections.our-story';
  eyebrow?: string;
  heading: string;
  intro?: string;
  chapters: StrapiOurStoryChapter[];
  quote?: string;
  quoteAuthor?: string;
  cta?: StrapiCtaButton;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiTestimonialSliderSection {
  __component: 'sections.testimonial-slider';
  heading?: string;
  maxItems?: number;
  visible?: boolean;
  anchorId?: string;
}

export interface StrapiCtaBannerSection {
  __component: 'sections.cta-banner';
  heading: string;
  subheading?: string;
  primaryCta?: StrapiCtaButton;
  secondaryCta?: StrapiCtaButton;
  backgroundToken?: string;
  visible?: boolean;
  anchorId?: string;
}

/* ── Collections ──────────────────────────────────────────── */

export interface StrapiClass {
  documentId: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: unknown; // blocks
  durationMinutes: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  discipline?: StrapiDiscipline;
  /** Price of ONE session in LKR (0 = free) */
  price: number;
  frequency?: string;
  coaches?: StrapiCoach[];
  /** one per line */
  targetAreas?: string;
  /** one per line */
  equipment?: string;
  thumbnail?: StrapiMedia;
  previewVideo?: StrapiMedia;
  featuredVideo?: StrapiMedia;
  gallery?: StrapiMedia[];
  /** blocks — shown as "What to expect" */
  whatToExpect?: unknown;
  isFree: boolean;
  sortOrder: number;
  seo?: StrapiSeo;
}

export interface StrapiDiscipline {
  documentId: string;
  name: string;
  slug: string;
  icon?: StrapiMedia;
  colour?: string;
}

export interface StrapiCoach {
  documentId: string;
  name: string;
  nickname?: string | null;
  slug: string;
  role?: string;
  bio?: unknown; // blocks
  shortBio?: string;
  photo?: StrapiMedia;
  yearsExperience?: number;
  specialties?: string;
  disciplines?: StrapiDiscipline[];
  instagram?: string;
  isHeadCoach: boolean;
  sortOrder: number;
  seo?: StrapiSeo;
}

export interface StrapiScheduleSlot {
  documentId: string;
  class: StrapiClass;
  coach?: StrapiCoach;
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  startTime: string;
  endTime: string;
  capacity: number;
  room?: string;
  isActive: boolean;
  notes?: string;
}

export interface StrapiTestimonial {
  documentId: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  photo?: StrapiMedia;
  rating: number;
  goal?: string;
  isFeatured: boolean;
}

export interface StrapiFaqCategory {
  documentId: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface StrapiFaq {
  documentId: string;
  question: string;
  answer: unknown; // blocks
  category?: StrapiFaqCategory;
  isFeatured: boolean;
  sortOrder: number;
}

export interface StrapiPost {
  documentId: string;
  title: string;
  slug: string;
  summary?: string;
  content: unknown; // blocks
  coverImage?: StrapiMedia;
  author?: StrapiAuthor;
  category?: StrapiPostCategory;
  tags?: string;
  readingTimeMinutes?: number;
  isFeatured: boolean;
  publishedAt: string;
  seo?: StrapiSeo;
}

export interface StrapiAuthor {
  documentId: string;
  name: string;
  slug: string;
  bio?: string;
  photo?: StrapiMedia;
}

export interface StrapiPostCategory {
  documentId: string;
  name: string;
  slug: string;
}

export interface StrapiGalleryItem {
  documentId: string;
  media: StrapiMedia;
  alt: string;
  caption?: string;
  category?: string;
  isFeatured: boolean;
  sortOrder: number;
}

export interface StrapiRedirect {
  documentId: string;
  from: string;
  to: string;
  statusCode: 'permanent' | 'temporary';
  isActive: boolean;
}

/* ── Page types ───────────────────────────────────────────── */

export type StrapiSection = Record<string, unknown> & {
  __component: string;
  visible?: boolean;
  anchorId?: string;
};

export interface StrapiPage {
  documentId: string;
  title: string;
  slug: string;
  sections: StrapiSection[];
  seo?: StrapiSeo;
}

/* ── API response wrappers ────────────────────────────────── */
export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
}

export interface StrapiLegalPage {
  documentId: string;
  title: string;
  slug: string;
  content: unknown; // blocks
  lastUpdated?: string;
  seo?: StrapiSeo;
}
