import type { StrapiGlobal, StrapiCoach, StrapiPost, StrapiFaq } from '../strapi/types';

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export function localBusinessSchema(global: StrapiGlobal) {
  return {
    '@context': 'https://schema.org',
    '@type': ['ExerciseGym', 'LocalBusiness'],
    name: global.siteName,
    description: global.siteTagline,
    url: SITE_URL,
    telephone: global.phone,
    email: global.email,
    address: global.address ? {
      '@type': 'PostalAddress',
      streetAddress: global.address,
    } : undefined,
    ...(global.instagram && {
      sameAs: [
        global.instagram,
        global.facebook,
        global.youtube,
      ].filter(Boolean),
    }),
    openingHoursSpecification: global.hoursJson
      ? Object.entries(global.hoursJson).map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
          opens: hours.split('–')[0]?.trim(),
          closes: hours.split('–')[1]?.trim(),
        }))
      : undefined,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function articleSchema(post: StrapiPost, authorName?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    datePublished: post.publishedAt,
    author: authorName ? { '@type': 'Person', name: authorName } : undefined,
    image: post.coverImage?.url,
    url: `${SITE_URL}/journal/${post.slug}`,
  };
}

export function faqSchema(faqs: StrapiFaq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        // blocks content — simplified to plain text fallback
        text: faq.question,
      },
    })),
  };
}

export function personSchema(coach: StrapiCoach) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: coach.name,
    jobTitle: coach.role,
    description: coach.shortBio,
    image: coach.photo?.url,
    url: `${SITE_URL}/coaches/${coach.slug}`,
  };
}
