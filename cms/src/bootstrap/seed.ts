/**
 * Default content seeder.
 * Runs on bootstrap only when the DB is empty (checks Global for existence).
 * Uses strapi.documents() — the Strapi v5 Documents API.
 */
import type { Core } from '@strapi/strapi';

export async function seedDefaultContent(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  // Guard — only skip if global already has a PUBLISHED version
  const publishedGlobal = await docs('api::global.global').findFirst({ status: 'published' });
  if (publishedGlobal) {
    strapi.log.info('[seed] Content already exists — skipping seed');
    return;
  }

  // If a draft exists but isn't published, publish it and other key content, then bail
  const draftGlobal = await docs('api::global.global').findFirst({});
  if (draftGlobal) {
    strapi.log.info('[seed] Draft content found — publishing all existing content…');
    await publishAllContent(strapi);
    return;
  }

  strapi.log.info('[seed] Empty database detected — seeding default content…');

  // ── Global Settings ──────────────────────────────────────────────────────
  await docs('api::global.global').create({
    status: 'published',
    data: {
      siteName: 'The Wolverine Hub',
      siteTagline: 'Where Iron Meets Instinct.',
      email: 'hello@thewolverinehub.com',
      phone: '+94 11 234 5678',
      address: '42 Duplication Road, Colombo 03, Sri Lanka',
      instagram: 'https://instagram.com/thewolverinehub',
      facebook: 'https://facebook.com/thewolverinehub',
      youtube: 'https://youtube.com/@thewolverinehub',
      experienceIntroAnimation: true,
      experienceWebgl: true,
      experienceSmoothScroll: true,
      experienceCustomCursor: false,
      experienceSoundDefault: false,
      experienceMotionIntensity: 'full',
    },
  });

  // ── Header ───────────────────────────────────────────────────────────────
  await docs('api::header.header').create({
    status: 'published',
    data: {
      menuItems: [
        { label: 'Classes',   href: '/classes',  indexNumber: '01', description: '24 disciplines. Every level.' },
        { label: 'Schedule',  href: '/schedule', indexNumber: '02', description: 'Book your next session.' },
        { label: 'Programs',  href: '/programs', indexNumber: '03', description: 'Starter · Signature · Transformation.' },
        { label: 'Coaches',   href: '/coaches',  indexNumber: '04', description: 'Train with the best.' },
        { label: 'Pricing',   href: '/pricing',  indexNumber: '05', description: 'Passes · Tokens · Add-ons.' },
        { label: 'Contact',   href: '/contact',  indexNumber: '06', description: 'Find us. Book a trial.' },
      ],
      primaryCta: { label: 'Free Trial', href: '/free-trial', variant: 'primary', openInNewTab: false },
      announcementBarEnabled: false,
      announcementBarColour: 'yellow',
    },
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  await docs('api::footer.footer').create({
    status: 'published',
    data: {
      wordmarkText: 'THE WOLVERINE HUB',
      newsletterEnabled: true,
      newsletterHeading: 'Train Smarter.',
      newsletterSubheading: 'Tips, schedules and offers. No fluff.',
      columns: [
        {
          heading: 'Train',
          links: [
            { label: 'All Classes',  href: '/classes',  openInNewTab: false },
            { label: 'Schedule',     href: '/schedule', openInNewTab: false },
            { label: 'Programs',     href: '/programs', openInNewTab: false },
            { label: 'Free Trial',   href: '/free-trial', openInNewTab: false },
          ],
        },
        {
          heading: 'About',
          links: [
            { label: 'Our Coaches',  href: '/coaches',  openInNewTab: false },
            { label: 'Pricing',      href: '/pricing',  openInNewTab: false },
            { label: 'Gallery',      href: '/gallery',  openInNewTab: false },
            { label: 'Contact',      href: '/contact',  openInNewTab: false },
          ],
        },
        {
          heading: 'Info',
          links: [
            { label: 'Blog',         href: '/blog',     openInNewTab: false },
            { label: 'FAQ',          href: '/faq',      openInNewTab: false },
            { label: 'Privacy',      href: '/privacy',  openInNewTab: false },
            { label: 'Terms',        href: '/terms',    openInNewTab: false },
          ],
        },
      ],
      legalLinks: [
        { label: 'Privacy Policy', href: '/privacy', openInNewTab: false },
        { label: 'Terms of Use',   href: '/terms',   openInNewTab: false },
      ],
      copyrightText: `© ${new Date().getFullYear()} The Wolverine Hub (Pvt) Ltd. All rights reserved.`,
    },
  });

  // ── UI Strings ───────────────────────────────────────────────────────────
  await docs('api::ui-strings.ui-strings').create({
    status: 'published',
    data: {
      skipLinkLabel: 'Skip to main content',
      searchPlaceholder: 'Search classes, coaches…',
      filterNoResults: 'No results found. Try a different filter.',
      loadMoreLabel: 'Load more',
      bookNowLabel: 'Book now',
      viewDetailsLabel: 'View details',
      fullBadge: 'Full',
      spotsLeftTemplate: '{n} spots left',
      introSkipLabel: 'Skip intro',
      formSuccessDefault: 'Thank you! We\'ll be in touch soon.',
      formErrorDefault: 'Something went wrong. Please try again.',
      notFoundHeading: 'Page not found.',
      notFoundBody: 'The page you\'re looking for doesn\'t exist.',
      errorHeading: 'Something went wrong.',
      errorBody: 'We\'re on it. Please try refreshing the page.',
    },
  });

  // ── Disciplines ──────────────────────────────────────────────────────────
  const disciplines = [
    { name: 'Boxing',                   slug: 'boxing',                   colour: '#D7141A' },
    { name: 'Muay Thai',                slug: 'muay-thai',                colour: '#1B3F94' },
    { name: 'Brazilian Jiu-Jitsu',      slug: 'bjj',                      colour: '#8E0B10' },
    { name: 'Kickboxing',               slug: 'kickboxing',               colour: '#FFC20E' },
    { name: 'Strength & Conditioning',  slug: 'strength-conditioning',    colour: '#555560' },
    { name: 'Wrestling',                slug: 'wrestling',                colour: '#0B2359' },
    { name: 'MMA',                      slug: 'mma',                      colour: '#D7141A' },
    { name: 'Yoga & Mobility',          slug: 'yoga',                     colour: '#3A3A42' },
  ];

  const disciplineIds: Record<string, string> = {};
  for (const d of disciplines) {
    const created = await docs('api::discipline.discipline').create({
      status: 'published',
      data: d,
    });
    disciplineIds[d.slug] = created.documentId;
  }

  // ── Classes ──────────────────────────────────────────────────────────────
  const classData = [
    { name: 'Boxing Fundamentals',      slug: 'boxing-fundamentals',     tagline: 'Master the sweet science', durationMinutes: 60, intensity: 'high',    level: 'all',          disciplineSlug: 'boxing',               isFree: false, sortOrder: 1 },
    { name: 'Muay Thai',                slug: 'muay-thai',               tagline: 'Eight limbs, one fighter', durationMinutes: 90, intensity: 'high',    level: 'intermediate', disciplineSlug: 'muay-thai',            isFree: false, sortOrder: 2 },
    { name: 'BJJ Open Mat',             slug: 'bjj-open-mat',            tagline: 'Live drilling & sparring',  durationMinutes: 90, intensity: 'medium',  level: 'all',          disciplineSlug: 'bjj',                  isFree: false, sortOrder: 3 },
    { name: 'Kickboxing',               slug: 'kickboxing',              tagline: 'Power, speed, precision',  durationMinutes: 60, intensity: 'high',    level: 'all',          disciplineSlug: 'kickboxing',           isFree: false, sortOrder: 4 },
    { name: 'Strength & Conditioning',  slug: 'strength-conditioning',   tagline: 'Build the base',           durationMinutes: 60, intensity: 'medium',  level: 'all',          disciplineSlug: 'strength-conditioning', isFree: false, sortOrder: 5 },
    { name: 'Wrestling',                slug: 'wrestling',               tagline: 'Control the mat',          durationMinutes: 75, intensity: 'extreme', level: 'advanced',     disciplineSlug: 'wrestling',            isFree: false, sortOrder: 6 },
    { name: 'MMA',                      slug: 'mma',                     tagline: 'The complete fighter',     durationMinutes: 90, intensity: 'extreme', level: 'advanced',     disciplineSlug: 'mma',                  isFree: false, sortOrder: 7 },
    { name: 'Yoga & Mobility',          slug: 'yoga-mobility',           tagline: 'Recovery & flexibility',   durationMinutes: 60, intensity: 'low',     level: 'all',          disciplineSlug: 'yoga',                 isFree: true,  sortOrder: 8 },
  ];

  for (const cls of classData) {
    const { disciplineSlug, ...rest } = cls;
    await docs('api::class.class').create({
      status: 'published',
      data: {
        ...rest,
        discipline: disciplineIds[disciplineSlug] ? { documentId: disciplineIds[disciplineSlug] } : undefined,
      },
    });
  }

  // ── Coaches ──────────────────────────────────────────────────────────────
  const coachData = [
    { name: 'Ashan Perera',       slug: 'ashan-perera',       role: 'Head Boxing Coach',        shortBio: 'National champion. 12 years ringside. 500+ amateur fights coached.',                                    isHeadCoach: true,  sortOrder: 1 },
    { name: 'Nadun Silva',        slug: 'nadun-silva',        role: 'Muay Thai & MMA',           shortBio: 'IFMA certified. Fights out of Bangkok. Holds wins in Thailand and Malaysia.',                            isHeadCoach: false, sortOrder: 2 },
    { name: 'Chamara Jayasinghe', slug: 'chamara-jayasinghe', role: 'BJJ Black Belt',            shortBio: 'IBJJF competitor since 2015. Pan Asian Bronze medallist. 4x Sri Lanka champion.',                        isHeadCoach: false, sortOrder: 3 },
    { name: 'Kasuni Rathnayake',  slug: 'kasuni-rathnayake',  role: 'Yoga & Recovery',           shortBio: 'RYT-500 certified. Mobility specialist for competitive athletes.',                                        isHeadCoach: false, sortOrder: 4 },
    { name: 'Tharaka Fernando',   slug: 'tharaka-fernando',   role: 'Strength & Conditioning',   shortBio: 'NSCA certified. Former national swimmer. Specialises in athletic performance.',                           isHeadCoach: false, sortOrder: 5 },
  ];

  for (const coach of coachData) {
    await docs('api::coach.coach').create({
      status: 'published',
      data: coach,
    });
  }

  // ── Pricing Tiers ────────────────────────────────────────────────────────
  const tiers = [
    {
      name: 'Starter', slug: 'starter', tagline: 'Your first month, done right.',
      features: ['2 classes per week', 'Access to open gym', 'Beginner workshops', 'App access'],
      isMostPopular: false, colour: 'blue', sortOrder: 1,
    },
    {
      name: 'Signature', slug: 'signature', tagline: 'For the committed athlete.',
      features: ['Unlimited classes', 'Priority booking', 'Nutrition guide', 'Monthly progress check-in', 'App access'],
      isMostPopular: true, colour: 'yellow', sortOrder: 2,
    },
    {
      name: 'Transformation', slug: 'transformation', tagline: 'Elite coaching with full access.',
      features: ['Everything in Signature', '2 personal sessions/month', 'Body composition analysis', 'Custom training plan', 'Direct coach WhatsApp'],
      isMostPopular: false, colour: 'red', sortOrder: 3,
    },
  ];

  const tierIds: Record<string, string> = {};
  for (const tier of tiers) {
    const created = await docs('api::pricing-tier.pricing-tier').create({
      status: 'published',
      data: tier,
    });
    tierIds[tier.slug] = created.documentId;
  }

  // ── Passes ───────────────────────────────────────────────────────────────
  const passes = [
    { tierSlug: 'starter',        duration: '1 Month',  durationDays: 30,  priceLKR: 9500,  isPurchasable: true, sortOrder: 1 },
    { tierSlug: 'starter',        duration: '3 Months', durationDays: 90,  priceLKR: 26000, isPurchasable: true, sortOrder: 2 },
    { tierSlug: 'signature',      duration: '1 Month',  durationDays: 30,  priceLKR: 16500, isPurchasable: true, sortOrder: 3 },
    { tierSlug: 'signature',      duration: '3 Months', durationDays: 90,  priceLKR: 45000, isPurchasable: true, sortOrder: 4 },
    { tierSlug: 'transformation', duration: '1 Month',  durationDays: 30,  priceLKR: 28000, isPurchasable: true, sortOrder: 5 },
    { tierSlug: 'transformation', duration: '3 Months', durationDays: 90,  priceLKR: 78000, isPurchasable: true, sortOrder: 6 },
  ];

  for (const pass of passes) {
    const { tierSlug, ...rest } = pass;
    await docs('api::pass.pass').create({
      status: 'published',
      data: {
        ...rest,
        tier: tierIds[tierSlug] ? { documentId: tierIds[tierSlug] } : undefined,
      },
    });
  }

  // ── Testimonials ─────────────────────────────────────────────────────────
  const testimonials = [
    { quote: 'The Wolverine Hub changed how I think about training. Not just a gym — it\'s a system.', authorName: 'Kasun M.', authorTitle: 'Member since 2022', rating: 5, isFeatured: true },
    { quote: 'I\'ve trained in Bangkok and KL. This place competes. The boxing programme here is elite.', authorName: 'Rashmi P.', authorTitle: 'Competitive Fighter', rating: 5, isFeatured: true },
    { quote: 'Six months in, 12kg down, and I feel genuinely unstoppable. The coaches never let you settle.', authorName: 'Dilnoza A.', authorTitle: 'Transformation Member', rating: 5, isFeatured: true },
    { quote: 'The BJJ programme is world-class. Coach Chamara has competed at the highest level and it shows.', authorName: 'Amila R.', authorTitle: 'BJJ Blue Belt', rating: 5, isFeatured: true },
    { quote: 'Best decision I made in 2024. The community here pushes you in ways no regular gym can.', authorName: 'Sahan W.', authorTitle: 'Signature Member', rating: 5, isFeatured: false },
    { quote: 'The yoga and mobility classes are underrated. My recovery time halved after joining.', authorName: 'Priya N.', authorTitle: 'Yoga & Signature Member', rating: 5, isFeatured: false },
  ];

  for (const t of testimonials) {
    await docs('api::testimonial.testimonial').create({ status: 'published', data: t });
  }

  // ── FAQs ─────────────────────────────────────────────────────────────────
  const faqs = [
    { question: 'Do I need experience to join?', answer: [{ type: 'paragraph', children: [{ type: 'text', text: 'No experience needed. We have beginner-friendly classes for every discipline. Our coaches will assess your level on arrival and point you to the right class.' }] }], isFeatured: true, sortOrder: 1 },
    { question: 'What should I bring to my first class?', answer: [{ type: 'paragraph', children: [{ type: 'text', text: 'Comfortable workout clothing, a water bottle, and a positive attitude. For combat classes, hand wraps are recommended — we sell them at the desk.' }] }], isFeatured: true, sortOrder: 2 },
    { question: 'How do I book a free trial?', answer: [{ type: 'paragraph', children: [{ type: 'text', text: 'Click the "Book a Free Trial" button anywhere on the site. You\'ll choose a class time, fill in a short form, and we\'ll confirm your spot by WhatsApp.' }] }], isFeatured: true, sortOrder: 3 },
    { question: 'Are there lock-in contracts?', answer: [{ type: 'paragraph', children: [{ type: 'text', text: 'No lock-ins. All our passes are month-to-month. Cancel anytime via your member dashboard or by contacting us directly.' }] }], isFeatured: false, sortOrder: 4 },
  ];

  for (const faq of faqs) {
    await docs('api::faq.faq').create({ status: 'published', data: faq });
  }

  // ── Home Page ─────────────────────────────────────────────────────────────
  await docs('api::page.page').create({
    status: 'published',
    data: {
      title: 'Home',
      slug: 'home',
      sections: [
        {
          __component: 'sections.hero-video',
          headline: 'Where Iron Meets Instinct.',
          subheadline: "Sri Lanka's most demanding training ground. Classes, coaching and programs built for those who mean it.",
          primaryCta:   { label: 'Book a Free Trial', href: '/free-trial',  variant: 'primary', openInNewTab: false },
          secondaryCta: { label: 'Explore Classes',   href: '/classes',     variant: 'ghost',   openInNewTab: false },
          visible: true,
          anchorId: 'hero',
        },
        {
          __component: 'sections.stat-counters',
          stats: [
            { number: '24+',  label: 'Disciplines' },
            { number: '1,200+', label: 'Active Members' },
            { number: '18',   label: 'Expert Coaches' },
            { number: '5',    label: 'Years Strong' },
          ],
          visible: true,
          anchorId: 'stats',
        },
        {
          __component: 'sections.marquee',
          items: ['Boxing', 'Muay Thai', 'Brazilian Jiu-Jitsu', 'Kickboxing', 'Strength & Conditioning', 'Wrestling', 'MMA', 'Yoga & Mobility', 'HIIT', 'Calisthenics'],
          speed: 'normal',
          visible: true,
        },
        {
          __component: 'sections.class-rail',
          heading: 'Every Discipline. Every Level.',
          cta: { label: 'All Classes', href: '/classes', variant: 'ghost', openInNewTab: false },
          visible: true,
          anchorId: 'classes',
        },
        {
          __component: 'sections.feature-split',
          eyebrow: 'Why The Wolverine Hub',
          heading: 'Built for the Relentless.',
          body: [
            { type: 'paragraph', children: [{ type: 'text', text: 'We didn\'t build a gym. We built a system — one that trains your body, sharpens your mind, and forges discipline through structured repetition and elite coaching.' }] },
            { type: 'paragraph', children: [{ type: 'text', text: 'Every class, every drill, every coach here is chosen for one reason: to make you better than you were yesterday.' }] },
          ],
          cta: { label: 'Our Programs', href: '/programs', variant: 'primary', openInNewTab: false },
          imagePosition: 'right',
          backgroundToken: 'ink',
          visible: true,
          anchorId: 'about',
        },
        {
          __component: 'sections.coach-carousel',
          heading: 'Train With the Best.',
          cta: { label: 'All Coaches', href: '/coaches', variant: 'ghost', openInNewTab: false },
          visible: true,
          anchorId: 'coaches',
        },
        {
          __component: 'sections.pricing-teaser',
          heading: 'Simple, Honest Pricing.',
          subheading: 'Pick a tier. Book your first class. No lock-ins.',
          cta: { label: 'See All Plans', href: '/pricing', variant: 'primary', openInNewTab: false },
          visible: true,
          anchorId: 'pricing',
        },
        {
          __component: 'sections.testimonial-slider',
          heading: 'The Members Speak.',
          maxItems: 6,
          visible: true,
          anchorId: 'testimonials',
        },
        {
          __component: 'sections.cta-banner',
          heading: 'Ready to Start?',
          subheading: 'Your first class is on us. No excuses. No delays.',
          primaryCta:   { label: 'Book a Free Trial', href: '/free-trial', variant: 'primary', openInNewTab: false },
          secondaryCta: { label: 'View Pricing',      href: '/pricing',    variant: 'ghost',   openInNewTab: false },
          backgroundToken: 'red',
          visible: true,
          anchorId: 'cta',
        },
      ],
      seo: {
        metaTitle: 'The Wolverine Hub — Where Iron Meets Instinct',
        metaDescription: "Sri Lanka's most demanding training ground. 24+ disciplines. Elite coaches. Classes for every level. Book your free trial today.",
      },
    },
  });

  strapi.log.info('[seed] Default content created successfully');
}

// ---------------------------------------------------------------------------
// Publish all draft documents for the content types that the front-end reads.
// Called when content exists but hasn't been published yet.
// ---------------------------------------------------------------------------
async function publishAllContent(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const singleTypes = [
    'api::global.global',
    'api::header.header',
    'api::footer.footer',
    'api::ui-strings.ui-strings',
  ];

  const collections = [
    'api::page.page',
    'api::class.class',
    'api::discipline.discipline',
    'api::coach.coach',
    'api::pricing-tier.pricing-tier',
    'api::pass.pass',
    'api::testimonial.testimonial',
    'api::faq.faq',
    'api::faq-category.faq-category',
  ];

  let published = 0;

  for (const uid of singleTypes) {
    const draft = await docs(uid).findFirst({});
    if (draft) {
      await docs(uid).publish({ documentId: draft.documentId });
      published++;
    }
  }

  for (const uid of collections) {
    const drafts = await docs(uid).findMany({ status: 'draft', limit: 200 });
    for (const draft of drafts) {
      await docs(uid).publish({ documentId: draft.documentId });
      published++;
    }
  }

  strapi.log.info(`[seed] Published ${published} draft documents`);
}
