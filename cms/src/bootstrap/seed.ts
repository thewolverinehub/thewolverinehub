/**
 * Default content seeder.
 * On empty DB: creates everything from scratch.
 * On existing DB: calls patchMissingData() to fill any gaps.
 */
import type { Core } from '@strapi/strapi';

export async function seedDefaultContent(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const publishedGlobal = await docs('api::global.global').findFirst({ status: 'published' });
  if (publishedGlobal) {
    strapi.log.info('[seed] Content exists — patching missing data…');
    await patchMissingData(strapi);
    return;
  }

  const draftGlobal = await docs('api::global.global').findFirst({});
  if (draftGlobal) {
    strapi.log.info('[seed] Draft content found — publishing…');
    await publishAllContent(strapi);
    return;
  }

  strapi.log.info('[seed] Empty DB — seeding all default content…');
  await seedAll(strapi);
}

// ---------------------------------------------------------------------------
// Full seed (empty DB)
// ---------------------------------------------------------------------------
async function seedAll(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  // ── Global ───────────────────────────────────────────────────────────────
  await docs('api::global.global').create({
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

  // ── Header ────────────────────────────────────────────────────────────────
  await docs('api::header.header').create({
    data: {
      menuItems: [
        { label: 'Classes',  href: '/classes',  indexNumber: '01', description: '24 disciplines. Every level.' },
        { label: 'Schedule', href: '/schedule', indexNumber: '02', description: 'Book your next session.' },
        { label: 'Programs', href: '/programs', indexNumber: '03', description: 'Starter · Signature · Transformation.' },
        { label: 'Coaches',  href: '/coaches',  indexNumber: '04', description: 'Train with the best.' },
        { label: 'Pricing',  href: '/pricing',  indexNumber: '05', description: 'Passes · Tokens · Add-ons.' },
        { label: 'Contact',  href: '/contact',  indexNumber: '06', description: 'Find us. Book a trial.' },
      ],
      primaryCta: { label: 'Free Trial', href: '/free-trial', variant: 'primary', openInNewTab: false },
      announcementBarEnabled: false,
      announcementBarColour: 'yellow',
    },
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  await docs('api::footer.footer').create({
    data: {
      wordmarkText: 'THE WOLVERINE HUB',
      newsletterEnabled: true,
      newsletterHeading: 'Train Smarter.',
      newsletterSubheading: 'Tips, schedules and offers. No fluff.',
      columns: [
        {
          heading: 'Train',
          links: [
            { label: 'All Classes', href: '/classes',   openInNewTab: false },
            { label: 'Schedule',    href: '/schedule',  openInNewTab: false },
            { label: 'Programs',    href: '/programs',  openInNewTab: false },
            { label: 'Free Trial',  href: '/free-trial', openInNewTab: false },
          ],
        },
        {
          heading: 'About',
          links: [
            { label: 'Our Coaches', href: '/coaches',  openInNewTab: false },
            { label: 'Pricing',     href: '/pricing',  openInNewTab: false },
            { label: 'Gallery',     href: '/gallery',  openInNewTab: false },
            { label: 'Contact',     href: '/contact',  openInNewTab: false },
          ],
        },
        {
          heading: 'Info',
          links: [
            { label: 'Blog',    href: '/blog',    openInNewTab: false },
            { label: 'FAQ',     href: '/faq',     openInNewTab: false },
            { label: 'Privacy', href: '/privacy', openInNewTab: false },
            { label: 'Terms',   href: '/terms',   openInNewTab: false },
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

  // ── UI Strings ────────────────────────────────────────────────────────────
  await docs('api::ui-strings.ui-strings').create({
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
      formSuccessDefault: "Thank you! We'll be in touch soon.",
      formErrorDefault: 'Something went wrong. Please try again.',
      notFoundHeading: 'Page not found.',
      notFoundBody: "The page you're looking for doesn't exist.",
      errorHeading: 'Something went wrong.',
      errorBody: "We're on it. Please try refreshing the page.",
    },
  });

  // ── Disciplines ───────────────────────────────────────────────────────────
  const disciplineIds = await seedDisciplines(strapi);

  // ── Classes ───────────────────────────────────────────────────────────────
  const classIds = await seedClasses(strapi, disciplineIds);

  // ── Coaches ───────────────────────────────────────────────────────────────
  const coachIds = await seedCoaches(strapi, disciplineIds);

  // ── Schedule ──────────────────────────────────────────────────────────────
  await seedSchedule(strapi);

  // ── Pricing tiers + passes ────────────────────────────────────────────────
  await seedPricing(strapi);

  // ── Testimonials ──────────────────────────────────────────────────────────
  await seedTestimonials(strapi);

  // ── FAQ categories + FAQs ─────────────────────────────────────────────────
  const faqCatIds = await seedFaqCategories(strapi);
  await seedFaqs(strapi, faqCatIds);

  // ── Authors + post categories + blog posts ────────────────────────────────
  const authorIds = await seedAuthors(strapi);
  const postCatIds = await seedPostCategories(strapi);
  await seedPosts(strapi, authorIds, postCatIds);

  // ── Amenities ─────────────────────────────────────────────────────────────
  await seedAmenities(strapi);

  // ── Legal pages ───────────────────────────────────────────────────────────
  await seedLegalPages(strapi);

  // ── Programs ─────────────────────────────────────────────────────────────
  await seedPrograms(strapi);

  // ── Home page + inner pages ───────────────────────────────────────────────
  await seedHomePage(strapi);
  await seedInnerPages(strapi);

  // Publish all drafts so content is live via the REST API
  await publishAllContent(strapi);

  strapi.log.info('[seed] All default content created successfully');
}

// ---------------------------------------------------------------------------
// Patch (existing DB — add any content types that are empty)
// Each section is independent — one failure does not block the rest.
// ---------------------------------------------------------------------------
async function patchMissingData(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  // Count via raw DB query — bypasses draft/published status confusion
  const count = async (uid: string): Promise<number> => {
    try {
      return await (strapi.db as any).query(uid).count();
    } catch {
      return 0;
    }
  };

  const tryRun = async (label: string, fn: () => Promise<void>): Promise<void> => {
    try {
      await fn();
    } catch (err: any) {
      strapi.log.warn(`[seed:patch] ${label} skipped — ${err?.message ?? err}`);
    }
  };

  // Remove duplicate documents created by the now-removed repairPublishedOnly pass.
  await tryRun('dedup', async () => deduplicateDocuments(strapi));

  // ── Reference maps (disciplines, classes, coaches) ────────────────────────
  let disciplineIds: Record<string, string> = {};
  await tryRun('disciplines', async () => {
    disciplineIds = (await count('api::discipline.discipline')) > 0
      ? await getExistingIds(strapi, 'api::discipline.discipline', 'slug')
      : await seedDisciplines(strapi);
  });

  let classIds: Record<string, string> = {};
  await tryRun('classes', async () => {
    classIds = (await count('api::class.class')) > 0
      ? await getExistingIds(strapi, 'api::class.class', 'slug')
      : await seedClasses(strapi, disciplineIds);
  });

  await tryRun('class content', async () => {
    await patchClassContent(strapi);
    strapi.log.info('[seed:patch] Class descriptions and levels patched');
  });

  let coachIds: Record<string, string> = {};
  await tryRun('coaches', async () => {
    if ((await count('api::coach.coach')) > 0) {
      coachIds = await getExistingIds(strapi, 'api::coach.coach', 'slug');
      await fixArrayFields(strapi, 'api::coach.coach', 'specialties');
      await patchCoachSpecialties(strapi);
    } else {
      coachIds = await seedCoaches(strapi, disciplineIds);
    }
  });

  strapi.log.info(`[seed:patch] Reference IDs — disciplines:${Object.keys(disciplineIds).length} classes:${Object.keys(classIds).length} coaches:${Object.keys(coachIds).length}`);

  // ── Schedule slots ────────────────────────────────────────────────────────
  await tryRun('schedule slots', async () => {
    if ((await count('api::schedule-slot.schedule-slot')) === 0) {
      await seedSchedule(strapi);
      strapi.log.info('[seed:patch] Created schedule slots');
    }
  });

  // ── Pricing tiers + passes ────────────────────────────────────────────────
  await tryRun('pricing', async () => {
    if ((await count('api::pricing-tier.pricing-tier')) === 0) {
      await seedPricing(strapi);
      strapi.log.info('[seed:patch] Created pricing tiers + passes');
    } else {
      // Fix legacy records where features was stored as a JSON array (pre-schema-change)
      await fixArrayFields(strapi, 'api::pricing-tier.pricing-tier', 'features');
    }
  });

  // ── Testimonials ──────────────────────────────────────────────────────────
  await tryRun('testimonials', async () => {
    if ((await count('api::testimonial.testimonial')) === 0) {
      await seedTestimonials(strapi);
      strapi.log.info('[seed:patch] Created testimonials');
    }
  });

  // ── FAQ categories ────────────────────────────────────────────────────────
  let faqCatIds: Record<string, string> = {};
  await tryRun('faq categories', async () => {
    if ((await count('api::faq-category.faq-category')) > 0) {
      faqCatIds = await getExistingIds(strapi, 'api::faq-category.faq-category', 'slug');
    } else {
      faqCatIds = await seedFaqCategories(strapi);
      strapi.log.info('[seed:patch] Created FAQ categories');
    }
  });

  // ── FAQs ──────────────────────────────────────────────────────────────────
  await tryRun('faqs', async () => {
    if ((await count('api::faq.faq')) === 0) {
      await seedFaqs(strapi, faqCatIds);
      strapi.log.info('[seed:patch] Created FAQs');
    }
  });

  // ── Authors ───────────────────────────────────────────────────────────────
  let authorIds: Record<string, string> = {};
  await tryRun('authors', async () => {
    if ((await count('api::author.author')) > 0) {
      authorIds = await getExistingIds(strapi, 'api::author.author', 'slug');
    } else {
      authorIds = await seedAuthors(strapi);
      strapi.log.info('[seed:patch] Created authors');
    }
  });

  // ── Post categories ───────────────────────────────────────────────────────
  let postCatIds: Record<string, string> = {};
  await tryRun('post categories', async () => {
    if ((await count('api::post-category.post-category')) > 0) {
      postCatIds = await getExistingIds(strapi, 'api::post-category.post-category', 'slug');
    } else {
      postCatIds = await seedPostCategories(strapi);
      strapi.log.info('[seed:patch] Created post categories');
    }
  });

  // ── Blog posts ────────────────────────────────────────────────────────────
  await tryRun('blog posts', async () => {
    if ((await count('api::post.post')) === 0) {
      await seedPosts(strapi, authorIds, postCatIds);
      strapi.log.info('[seed:patch] Created blog posts');
    } else {
      await fixArrayFields(strapi, 'api::post.post', 'tags');
    }
  });

  // ── Amenities ─────────────────────────────────────────────────────────────
  await tryRun('amenities', async () => {
    if ((await count('api::amenity.amenity')) === 0) {
      await seedAmenities(strapi);
      strapi.log.info('[seed:patch] Created amenities');
    }
  });

  // ── Legal pages ───────────────────────────────────────────────────────────
  await tryRun('legal pages', async () => {
    if ((await count('api::legal-page.legal-page')) === 0) {
      await seedLegalPages(strapi);
      strapi.log.info('[seed:patch] Created legal pages');
    }
  });

  // ── Programs ─────────────────────────────────────────────────────────────
  await tryRun('programs', async () => {
    if ((await count('api::program.program')) === 0) {
      await seedPrograms(strapi);
      strapi.log.info('[seed:patch] Created programs');
    }
  });

  // ── Home page — always upsert so version-bump rewrites sections ──────────
  await tryRun('home page', async () => {
    await seedHomePage(strapi);
  });

  // ── Inner pages (all routes except home) — idempotent ────────────────────
  await tryRun('inner pages', async () => {
    await seedInnerPages(strapi);
  });

  // ── Ensure everything is published ────────────────────────────────────────
  await tryRun('publish sweep', async () => {
    await publishAllContent(strapi);
  });

  strapi.log.info('[seed:patch] Patch run complete');
}

// ---------------------------------------------------------------------------
// Helper: get existing documentIds keyed by a slug/name field
// Uses raw db.query so published-only documents (no separate draft) are found.
// ---------------------------------------------------------------------------
async function getExistingIds(
  strapi: Core.Strapi,
  uid: string,
  field: string,
): Promise<Record<string, string>> {
  const items: any[] = await (strapi.db as any).query(uid).findMany({ limit: 200 });
  const map: Record<string, string> = {};
  for (const item of items) {
    if (item[field]) map[item[field]] = item.documentId ?? item.document_id ?? String(item.id);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Helper: get raw integer IDs (for db.query relation inserts)
// ---------------------------------------------------------------------------
async function getRawIntIds(
  strapi: Core.Strapi,
  uid: string,
  field: string,
): Promise<Record<string, number>> {
  const items: any[] = await (strapi.db as any).query(uid).findMany({ limit: 200 });
  const map: Record<string, number> = {};
  for (const item of items) {
    if (item[field] && item.id) map[item[field]] = item.id;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Helper: generate a Strapi v5 compatible 24-char documentId
// ---------------------------------------------------------------------------
function genDocId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

// ---------------------------------------------------------------------------
// Helper: remove duplicate DB rows that share the same documentId.
// Keeps the row with the earliest id (the original seeded entry) and deletes
// the rest.  Safe to call multiple times — skips content types with no dups.
// ---------------------------------------------------------------------------
async function deduplicateDocuments(strapi: Core.Strapi): Promise<void> {
  const uids = [
    'api::global.global', 'api::header.header', 'api::footer.footer',
    'api::ui-strings.ui-strings', 'api::discipline.discipline',
    'api::class.class', 'api::coach.coach', 'api::schedule-slot.schedule-slot',
    'api::pricing-tier.pricing-tier', 'api::pass.pass',
    'api::testimonial.testimonial', 'api::faq-category.faq-category',
    'api::faq.faq', 'api::post-category.post-category',
    'api::author.author', 'api::post.post', 'api::amenity.amenity',
    'api::program.program', 'api::legal-page.legal-page', 'api::page.page',
  ];

  let totalRemoved = 0;
  for (const uid of uids) {
    try {
      const db = (strapi.db as any).query(uid);
      const rows: any[] = await db.findMany({ limit: 2000 });

      const seen = new Map<string, number>();
      const toDelete: number[] = [];

      for (const row of rows.sort((a: any, b: any) => a.id - b.id)) {
        const docId: string = row.documentId ?? String(row.id);
        if (seen.has(docId)) {
          toDelete.push(row.id);
        } else {
          seen.set(docId, row.id);
        }
      }

      for (const id of toDelete) {
        await db.delete({ where: { id } });
        totalRemoved++;
      }
    } catch { /* content type may not exist yet */ }
  }

  if (totalRemoved > 0) {
    strapi.log.info(`[seed:patch] Removed ${totalRemoved} duplicate document rows`);
  }
}

// ---------------------------------------------------------------------------
// Helper: create draft copies for any published-only documents.
//
// In Strapi v5, docs.create({ status:'published' }) creates a single row with
// publishedAt set but NO separate draft row.  The REST API's internal handler
// calls findFirst()/findMany() without an explicit status — which defaults to
// DRAFT context — so it returns null/[] for published-only documents → 404.
//
// Fix: for every published-only document, insert a matching draft row (same
// documentId, publishedAt = null).  The REST API can then locate the document
// via the draft row and serve the published content to public users.
// ---------------------------------------------------------------------------
async function repairPublishedOnly(strapi: Core.Strapi): Promise<void> {
  const uids = [
    'api::global.global', 'api::header.header', 'api::footer.footer',
    'api::ui-strings.ui-strings', 'api::discipline.discipline',
    'api::class.class', 'api::coach.coach', 'api::schedule-slot.schedule-slot',
    'api::pricing-tier.pricing-tier', 'api::pass.pass',
    'api::testimonial.testimonial', 'api::faq-category.faq-category',
    'api::faq.faq', 'api::post-category.post-category',
    'api::author.author', 'api::post.post', 'api::amenity.amenity',
    'api::program.program', 'api::legal-page.legal-page', 'api::page.page',
  ];

  let created = 0;
  for (const uid of uids) {
    try {
      const db = (strapi.db as any).query(uid);
      const allRows: any[] = await db.findMany({ limit: 1000 });

      const draftDocIds = new Set<string>(
        allRows
          .filter((r: any) => !r.publishedAt)
          .map((r: any) => r.documentId ?? String(r.id)),
      );

      for (const row of allRows) {
        const docId: string = row.documentId ?? String(row.id);
        if (!row.publishedAt || draftDocIds.has(docId)) continue;

        // Extract scalar fields (skip id and publishedAt — new row needs fresh id + null publishedAt)
        const { id, publishedAt, published_at, ...draft } = row;
        try {
          await db.create({ data: { ...draft, documentId: docId, publishedAt: null } });
          created++;
        } catch { /* already exists or constraint — skip */ }
      }
    } catch { /* content type not yet registered — skip */ }
  }

  if (created > 0) {
    strapi.log.info(`[seed:patch] Created ${created} draft copies for published-only documents`);
  }
}

// ---------------------------------------------------------------------------
// Helper: convert any field stored as a JSON array back to a newline string.
// Needed when a schema changes from json → text but old rows keep array values.
// ---------------------------------------------------------------------------
async function patchCoachSpecialties(strapi: Core.Strapi): Promise<void> {
  const db = (strapi.db as any);
  const specialtiesMap: Record<string, string> = {
    'ashan-perera':      'Technical boxing\nSparring preparation\nFootwork and defence\nCombination drilling\nCompetition coaching',
    'nadun-silva':       'Muay Thai striking\nClinch and knee work\nMMA transitions\nThai pad coaching\nFight camp preparation',
    'chamara-jayasinghe':'Guard systems\nSubmission finishing\nPositional sparring\nCompetition strategy\nNo-gi grappling',
    'kasuni-rathnayake': 'Athlete recovery yoga\nHip flexor and hamstring release\nShoulder mobility\nBreath control\nInjury prevention',
    'tharaka-fernando':  'Periodised strength programming\nExplosive power development\nMetabolic conditioning\nCombat sports S&C\nSwimmer-to-athlete transitions',
  };
  const rows: any[] = await db.query('api::coach.coach').findMany({ limit: 50 });
  for (const row of rows) {
    if (!row.specialties && specialtiesMap[row.slug]) {
      await db.query('api::coach.coach').update({
        where: { id: row.id },
        data: { specialties: specialtiesMap[row.slug] },
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Patch class descriptions, levels, and taglines for a complete demo
// ---------------------------------------------------------------------------
async function patchClassContent(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const db   = (strapi.db as any);

  const h3 = (text: string) => ({ type: 'heading', level: 3, children: [{ type: 'text', text }] });
  const p   = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] });
  const ul  = (...items: string[]) => ({
    type: 'list', format: 'unordered',
    children: items.map(t => ({ type: 'list-item', children: [{ type: 'text', text: t }] })),
  });

  const contentMap: Record<string, { level: string; tagline: string; description: unknown[] }> = {
    'boxing-fundamentals': {
      level: 'beginner',
      tagline: 'Master the sweet science from day one.',
      description: [
        p('The foundation of every combat discipline starts here. Boxing Fundamentals builds the technical base that makes every strike, movement, and combination in your martial arts career cleaner and more effective.'),
        h3('What You\'ll Train'),
        ul('Stance, guard, and footwork patterns', 'Jab–cross–hook–uppercut mechanics', 'Defensive slipping, rolling, and parrying', 'Structured pad work with partner drills', 'Heavy bag rounds with coach feedback', 'Shadow boxing for pattern ingraining'),
        h3('Who This Class Is For'),
        p('Complete beginners through intermediate fighters wanting to sharpen the basics. No prior boxing or martial arts experience is required. Coach Ashan structures each session to challenge every level in the room.'),
        h3('What To Bring'),
        ul('16oz boxing gloves (available to purchase at reception)', 'Hand wraps — 180cm cotton (essential)', 'Mouth guard recommended from session 2 onward', 'Training shoes with lateral support', 'Water bottle'),
      ],
    },
    'muay-thai': {
      level: 'intermediate',
      tagline: 'Eight limbs. One complete striking system.',
      description: [
        p('The art of eight limbs demands total-body coordination, timing, and explosive output. Our Muay Thai programme is built on authentic Thai methodology — structured rounds, dedicated pad holding, and a pace that develops real fight conditioning.'),
        h3('What You\'ll Train'),
        ul('Teep (push kick) and round kick mechanics', 'Elbow and knee striking — entries and exits', 'Clinch work, sweeps, and break sequences', 'Thai-style pad holding technique', 'Controlled sparring rounds (gear required)', 'Timing drills and counter-attack patterns'),
        h3('Who This Class Is For'),
        p('Members with 3+ months of any striking base — boxing, kickboxing, or prior Muay Thai. Basic conditioning is recommended; classes run at authentic Thai tempo with timed rounds. Coach Nadun will assess your level before your first session.'),
        h3('What To Bring'),
        ul('16oz boxing gloves or Muay Thai gloves', 'Shin guards (mandatory)', 'Hand wraps', 'Mouth guard', 'Optional: ankle supports'),
      ],
    },
    'bjj-open-mat': {
      level: 'beginner',
      tagline: 'Live drilling and rolling. Every session.',
      description: [
        p('Brazilian Jiu-Jitsu at its most effective is learned by doing — not watching. Our Open Mat sessions run structured position drilling before opening the mat for live rolling, giving every student real reps in every class.'),
        h3('What You\'ll Train'),
        ul('Guard pass and sweep mechanics', 'Mount and back control positions', 'Submission entries: armbar, triangle, RNC, guillotine', 'Escapes from dominant positions', 'Timed positional sparring', 'Full live rolling rounds'),
        h3('Who This Class Is For'),
        p('All levels are genuinely welcome. Beginners are partnered with patient upper belts who understand how to develop new grapplers without injury. No prior experience required — show up curious and ready to learn.'),
        h3('What To Bring'),
        ul('Clean gi (rental available at reception — ask in advance)', 'Or rash guard + shorts for no-gi', 'Mouth guard strongly recommended', 'Nail clippers — please trim before class', 'Water bottle'),
      ],
    },
    'kickboxing': {
      level: 'beginner',
      tagline: 'Power, speed, precision — in every combination.',
      description: [
        p('Kickboxing strips combat sport down to its most explosive expression — high-percentage strikes delivered with power, speed, and timing. Every class builds technical striking skill alongside the conditioning to use it.'),
        h3('What You\'ll Train'),
        ul('Round kick, teep, and side kick mechanics', 'Punch–kick integration and combination flow', 'Head movement and evasive footwork', 'Partner pad rounds with structured combos', 'Heavy bag circuits and finisher drills', 'Basic defensive counters'),
        h3('Who This Class Is For'),
        p('All levels — from complete beginners to cross-trainers from boxing or Muay Thai. Excellent as a standalone fitness and skills class, or as a technical foundation before moving into full Muay Thai.'),
        h3('What To Bring'),
        ul('Boxing gloves (16oz recommended)', 'Shin guards', 'Hand wraps', 'Training shoes', 'Water bottle'),
      ],
    },
    'strength-conditioning': {
      level: 'beginner',
      tagline: 'Build the athletic base that makes everything else better.',
      description: [
        p('Combat athletes don\'t just need fitness — they need explosive power, injury resilience, and the capacity to sustain high output. Coach Tharaka programmes across rolling 8-week blocks with progressive overload built in from day one.'),
        h3('What You\'ll Train'),
        ul('Barbell squat and deadlift progressions', 'Upper body push and pull — bench, row, overhead', 'Explosive variations: hang cleans, jump squats', 'Metabolic conditioning and energy system work', 'Core stability and anti-rotation strength', 'Injury prevention and mobility accessory work'),
        h3('Who This Class Is For'),
        p('Any background — complete beginners and experienced strength athletes train together. The programme scales to individual levels. Ideal as a complement to your combat training, or as a standalone performance programme.'),
        h3('What To Bring'),
        ul('Training shoes with flat sole (lifting shoes optional)', 'Lifting belt (optional — provided for heavy days)', 'Chalk available', 'Water bottle'),
      ],
    },
    'wrestling': {
      level: 'advanced',
      tagline: 'Control the mat. Dominate the fight.',
      description: [
        p('The most physically demanding 75 minutes at The Wolverine Hub. Wrestling is the skill that decides where the fight happens — and the athlete who controls position controls the outcome. Coach Chamara\'s wrestling programme is built on competition-proven technique.'),
        h3('What You\'ll Train'),
        ul('Penetration step and level change mechanics', 'Double leg and single leg takedowns', 'Sprawl defence and hip blocking', 'Mat return and ride control', 'Cage and wall wrestling entries', 'Tie-up positions and grip fighting'),
        h3('Who This Class Is For'),
        p('Athletes with serious combat experience — minimum 12 active months of consistent training in any combat sport. You should be capable of sustaining near-maximal output for 7-minute rounds. This class is not scaled for beginners.'),
        h3('What To Bring'),
        ul('Wrestling shoes (strongly recommended)', 'Compression shorts or spats', 'Rash guard', 'Knee pads (recommended)', 'Mouth guard'),
      ],
    },
    'mma': {
      level: 'advanced',
      tagline: 'The complete fighter. Built here.',
      description: [
        p('Mixed martial arts is the proving ground where all disciplines converge. Our MMA programme integrates striking, grappling, and transitions into a complete fighting system — structured for serious amateur and competition-level athletes.'),
        h3('What You\'ll Train'),
        ul('Striking-to-takedown chain attacks', 'Clinch transitions and dirty boxing', 'Takedown defence and cage control', 'Ground-and-pound positioning and mechanics', 'Stand-up grappling and trip combinations', 'Sparring: technical light and controlled hard contact'),
        h3('Who This Class Is For'),
        p('Athletes with 6+ months of active, consistent training in both a striking discipline and a grappling discipline. Prerequisite screening applies — book an assessment session before attending. Coach Nadun personally assesses all new MMA students.'),
        h3('What To Bring'),
        ul('MMA gloves (4oz)', 'Boxing or Muay Thai gloves (for sparring rounds)', 'Shin guards', 'Rash guard and shorts or spats', 'Headgear (mandatory for sparring)', 'Mouth guard'),
      ],
    },
    'yoga-mobility': {
      level: 'beginner',
      tagline: 'Recover smarter. Move better. Last longer.',
      description: [
        p('The single best investment a combat athlete can make in the longevity of their training. Coach Kasuni\'s sessions target the specific restrictions and imbalances that accumulate from striking, grappling, and heavy lifting — the work that prevents you from becoming unavailable to train.'),
        h3('What You\'ll Train'),
        ul('Hip flexor and groin complex release', 'Thoracic spine rotation and extension', 'Hamstring and posterior chain lengthening', 'Shoulder complex — internal/external rotation', 'Active flexibility for guard and kick mechanics', 'Nervous system regulation and breath work'),
        h3('Who This Class Is For'),
        p('Every athlete, every level. Designed specifically for fighters and strength athletes — no yoga background or experience required. The sessions use athletic movement science, not yoga tradition. Most members notice improved range in their combat classes within 2–3 weeks.'),
        h3('What To Bring'),
        ul('Yoga mat (provided — bring your own if preferred)', 'Comfortable training wear — no shoes needed', 'Water bottle'),
      ],
    },
  };

  const rows: any[] = await db.query('api::class.class').findMany({ limit: 50 });
  let updated = 0;
  for (const row of rows) {
    const patch = contentMap[row.slug];
    if (!patch) continue;
    try {
      await docs('api::class.class').update({
        documentId: row.documentId,
        data: {
          level:       patch.level,
          tagline:     patch.tagline,
          description: patch.description,
        },
      });
      updated++;
    } catch (e: any) {
      strapi.log.warn(`[seed:patch] class ${row.slug} update failed — ${e?.message ?? e}`);
    }
  }
  if (updated > 0) {
    strapi.log.info(`[seed:patch] Updated ${updated} class descriptions and levels`);
  }
}

async function fixArrayFields(
  strapi: Core.Strapi,
  uid: string,
  ...fields: string[]
): Promise<void> {
  const rows: any[] = await (strapi.db as any).query(uid).findMany({ limit: 500 });
  for (const row of rows) {
    const updates: Record<string, string> = {};
    for (const f of fields) {
      if (Array.isArray(row[f])) {
        updates[f] = (row[f] as string[]).filter(Boolean).join('\n');
      }
    }
    if (Object.keys(updates).length > 0) {
      await (strapi.db as any).query(uid).update({ where: { id: row.id }, data: updates });
    }
  }
}

// ---------------------------------------------------------------------------
// Disciplines
// ---------------------------------------------------------------------------
async function seedDisciplines(strapi: Core.Strapi): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    { name: 'Boxing',                  slug: 'boxing',                colour: '#D7141A' },
    { name: 'Muay Thai',               slug: 'muay-thai',             colour: '#1B3F94' },
    { name: 'Brazilian Jiu-Jitsu',     slug: 'bjj',                   colour: '#8E0B10' },
    { name: 'Kickboxing',              slug: 'kickboxing',            colour: '#FFC20E' },
    { name: 'Strength & Conditioning', slug: 'strength-conditioning', colour: '#555560' },
    { name: 'Wrestling',               slug: 'wrestling',             colour: '#0B2359' },
    { name: 'MMA',                     slug: 'mma',                   colour: '#D7141A' },
    { name: 'Yoga & Mobility',         slug: 'yoga',                  colour: '#3A3A42' },
  ];
  const ids: Record<string, string> = {};
  for (const d of list) {
    const c = await docs('api::discipline.discipline').create({ data:d });
    ids[d.slug] = c.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Classes
// ---------------------------------------------------------------------------
async function seedClasses(
  strapi: Core.Strapi,
  disciplineIds: Record<string, string>,
): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    {
      name: 'Boxing Fundamentals', slug: 'boxing-fundamentals',
      tagline: 'Master the sweet science from day one.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Learn the foundations of boxing — stance, footwork, jab-cross combinations, and defensive movement. Suitable for complete beginners through to intermediate fighters looking to sharpen the basics.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Each session builds on the last, with structured pad work, bag rounds, and partner drills. Gloves and wraps required.' }] },
      ],
      durationMinutes: 60, intensity: 'high', level: 'all', disciplineSlug: 'boxing', isFree: false, sortOrder: 1,
    },
    {
      name: 'Muay Thai', slug: 'muay-thai',
      tagline: 'Eight limbs. One complete striking system.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'The art of eight limbs — fists, elbows, knees, and kicks. Our Muay Thai programme develops full-contact striking technique, clinch work, and defensive awareness through structured drills and sparring.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Classes are run in authentic Thai-style rounds with dedicated pad holding. Intermediate fitness level recommended.' }] },
      ],
      durationMinutes: 90, intensity: 'high', level: 'intermediate', disciplineSlug: 'muay-thai', isFree: false, sortOrder: 2,
    },
    {
      name: 'BJJ Open Mat', slug: 'bjj-open-mat',
      tagline: 'Live drilling and rolling. Every session.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Brazilian Jiu-Jitsu structured drilling followed by open rolling. Coach Chamara runs position-specific rounds — guard, mount, back control — then opens the mat for timed sparring.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Gi and no-gi options available. Beginners are paired with patient upper belts to accelerate learning without injury risk.' }] },
      ],
      durationMinutes: 90, intensity: 'medium', level: 'all', disciplineSlug: 'bjj', isFree: false, sortOrder: 3,
    },
    {
      name: 'Kickboxing', slug: 'kickboxing',
      tagline: 'Power, speed, precision — in every combination.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'High-energy kickboxing classes combining punching and kicking technique with conditioning rounds. Great for building fight-ready fitness alongside striking skill.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Classes blend technical instruction, partner pad work, and bag rounds. All levels welcome.' }] },
      ],
      durationMinutes: 60, intensity: 'high', level: 'all', disciplineSlug: 'kickboxing', isFree: false, sortOrder: 4,
    },
    {
      name: 'Strength & Conditioning', slug: 'strength-conditioning',
      tagline: 'Build the athletic base that makes everything else better.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Periodised strength and conditioning designed specifically for combat athletes. Squat, hinge, push, pull — loaded progressively across a rolling 8-week block.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Coach Tharaka programmes for power output, injury resilience, and metabolic conditioning. Available as a standalone class or as a complement to your combat training.' }] },
      ],
      durationMinutes: 60, intensity: 'medium', level: 'all', disciplineSlug: 'strength-conditioning', isFree: false, sortOrder: 5,
    },
    {
      name: 'Wrestling', slug: 'wrestling',
      tagline: 'Control the mat. Dominate the fight.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Olympic-style and freestyle wrestling focused on takedowns, control positions, and mat returns. One of the most physically demanding classes we offer.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Ideal for MMA fighters wanting cage control or BJJ practitioners looking to improve top game. Advanced fitness required.' }] },
      ],
      durationMinutes: 75, intensity: 'extreme', level: 'advanced', disciplineSlug: 'wrestling', isFree: false, sortOrder: 6,
    },
    {
      name: 'MMA', slug: 'mma',
      tagline: 'The complete fighter. Built here.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Full mixed martial arts training — striking to grappling transitions, clinch work, takedown defence, and ground-and-pound. Structured for serious amateur and competitive fighters.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Requires at least 6 months of striking or grappling base. Prerequisite screening applies.' }] },
      ],
      durationMinutes: 90, intensity: 'extreme', level: 'advanced', disciplineSlug: 'mma', isFree: false, sortOrder: 7,
    },
    {
      name: 'Yoga & Mobility', slug: 'yoga-mobility',
      tagline: 'Recover smarter. Move better.',
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Recovery-focused yoga designed for athletes. Coach Kasuni targets the common tightness patterns in fighters — hip flexors, thoracic spine, hamstrings, and shoulders.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Open to all levels. No yoga experience needed. An essential complement to your combat training schedule.' }] },
      ],
      durationMinutes: 60, intensity: 'low', level: 'all', disciplineSlug: 'yoga', isFree: true, sortOrder: 8,
    },
  ];

  const ids: Record<string, string> = {};
  for (const cls of list) {
    const { disciplineSlug, ...rest } = cls;
    const c = await docs('api::class.class').create({
      data: {
        ...rest,
        discipline: disciplineIds[disciplineSlug] ? { documentId: disciplineIds[disciplineSlug] } : undefined,
      },
    });
    ids[cls.slug] = c.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Coaches
// ---------------------------------------------------------------------------
async function seedCoaches(
  strapi: Core.Strapi,
  disciplineIds: Record<string, string>,
): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    {
      name: 'Ashan Perera', slug: 'ashan-perera', role: 'Head Boxing Coach',
      shortBio: 'National champion. 12 years ringside. 500+ amateur fights coached.',
      bio: [
        { type: 'paragraph', children: [{ type: 'text', text: "Ashan Perera is Sri Lanka's most decorated boxing coach, having trained national-level champions for over a decade. He began his career as an amateur fighter, reaching the national finals three times before transitioning to coaching full-time." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'His coaching philosophy is built on technical precision and mental toughness. Every class under Ashan is structured, demanding, and purposeful — no filler, no fluff. He has developed fighters who have competed internationally across Asia.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'At The Wolverine Hub, Ashan leads all boxing programmes from fundamentals through to competition preparation.' }] },
      ],
      specialties: 'Technical boxing\nSparring preparation\nFootwork and defence\nCombination drilling\nCompetition coaching',
      yearsExperience: 12,
      isHeadCoach: true, sortOrder: 1,
      disciplineSlugs: ['boxing'],
    },
    {
      name: 'Nadun Silva', slug: 'nadun-silva', role: 'Muay Thai & MMA Coach',
      shortBio: 'IFMA certified. Fights out of Bangkok. Wins across Thailand and Malaysia.',
      bio: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Nadun Silva trained in Thailand for four years under a Lumpinee-ranked kru before returning to Sri Lanka to bring authentic Muay Thai training to Colombo. He holds an IFMA Level 2 coaching certification.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'His classes are known for their intensity and authenticity — structured like a Thai camp, with timed rounds, Thai pad work, and a discipline that develops both fighters and fitness athletes.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Nadun also heads the MMA programme, bringing a complete striking-to-grappling game shaped by years of cross-training.' }] },
      ],
      specialties: 'Muay Thai striking\nClinch and knee work\nMMA transitions\nThai pad coaching\nFight camp preparation',
      yearsExperience: 9,
      isHeadCoach: false, sortOrder: 2,
      disciplineSlugs: ['muay-thai', 'kickboxing', 'mma'],
    },
    {
      name: 'Chamara Jayasinghe', slug: 'chamara-jayasinghe', role: 'BJJ Black Belt',
      shortBio: 'IBJJF competitor since 2015. Pan Asian Bronze. 4× Sri Lanka champion.',
      bio: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Chamara Jayasinghe received his black belt from a Gracie Barra lineage instructor after competing extensively across Asia. He has medalled at the Pan Asian Championships and won four consecutive Sri Lanka Open titles.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'His teaching style breaks the complexity of BJJ into logical, connectable positions — ideal for beginners building their framework and for experienced grapplers refining their competition game.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Coach Chamara personally oversees all belt promotions at The Wolverine Hub BJJ programme.' }] },
      ],
      specialties: 'Guard systems\nSubmission finishing\nPositional sparring\nCompetition strategy\nNo-gi grappling',
      yearsExperience: 11,
      isHeadCoach: false, sortOrder: 3,
      disciplineSlugs: ['bjj', 'wrestling'],
    },
    {
      name: 'Kasuni Rathnayake', slug: 'kasuni-rathnayake', role: 'Yoga & Recovery Coach',
      shortBio: 'RYT-500 certified. Mobility specialist for competitive athletes.',
      bio: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Kasuni Rathnayake holds a 500-hour Yoga Teacher Training certification specialising in athletic recovery and injury prevention. She has worked with national-level athletes across multiple disciplines.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Her approach is evidence-based and athlete-focused — no incense, no philosophy. Every session targets the movement restrictions most common in fighters and builds the flexibility and joint stability that prevents injury and improves performance.' }] },
      ],
      specialties: 'Athlete recovery yoga\nHip flexor and hamstring release\nShoulder mobility\nBreath control\nInjury prevention',
      yearsExperience: 7,
      isHeadCoach: false, sortOrder: 4,
      disciplineSlugs: ['yoga'],
    },
    {
      name: 'Tharaka Fernando', slug: 'tharaka-fernando', role: 'Strength & Conditioning Coach',
      shortBio: 'NSCA certified. Former national swimmer. Athletic performance specialist.',
      bio: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Tharaka Fernando is an NSCA-certified Strength and Conditioning Specialist with a background as a competitive national-level swimmer. He brings a sports science approach to every programme he designs.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "His S&C classes are periodised across 8-week blocks, targeting the specific physical demands of combat sports — explosive power, lactate threshold, and structural resilience. If you've ever wondered why your conditioning breaks down in the third round, Tharaka will tell you why — and fix it." }] },
      ],
      specialties: 'Periodised strength programming\nExplosive power development\nMetabolic conditioning\nCombat sports S&C\nSwimmer-to-athlete transitions',
      yearsExperience: 8,
      isHeadCoach: false, sortOrder: 5,
      disciplineSlugs: ['strength-conditioning'],
    },
  ];

  const ids: Record<string, string> = {};
  for (const coach of list) {
    const { disciplineSlugs, ...rest } = coach;
    const disciplines = disciplineSlugs
      .filter((s: string) => disciplineIds[s])
      .map((s: string) => ({ documentId: disciplineIds[s] }));
    const c = await docs('api::coach.coach').create({
      data: { ...rest, disciplines },
    });
    ids[coach.slug] = c.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Schedule slots — full week
// Uses raw db.query().create() so that published-only class/coach relations
// are resolved correctly (documents API draft-lookup fails for them).
// ---------------------------------------------------------------------------
async function seedSchedule(strapi: Core.Strapi): Promise<void> {
  // Fetch raw integer IDs keyed by slug — bypasses draft/published confusion
  const classRawIds = await getRawIntIds(strapi, 'api::class.class', 'slug');
  const coachRawIds = await getRawIntIds(strapi, 'api::coach.coach', 'slug');

  type SlotDef = {
    weekday: string; startTime: string; endTime: string;
    classSlug: string; coachSlug: string; room: string; capacity: number;
  };

  const slots: SlotDef[] = [
    // ── Monday ──────────────────────────────────────────────────────────────
    { weekday: 'monday', startTime: '06:00', endTime: '07:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando', room: 'Weights Floor', capacity: 16 },
    { weekday: 'monday', startTime: '07:00', endTime: '08:00', classSlug: 'boxing-fundamentals',   coachSlug: 'ashan-perera',      room: 'Boxing Ring',   capacity: 20 },
    { weekday: 'monday', startTime: '12:00', endTime: '13:00', classSlug: 'kickboxing',            coachSlug: 'nadun-silva',       room: 'Main Floor',    capacity: 18 },
    { weekday: 'monday', startTime: '17:30', endTime: '18:30', classSlug: 'yoga-mobility',         coachSlug: 'kasuni-rathnayake', room: 'Studio',        capacity: 15 },
    { weekday: 'monday', startTime: '18:30', endTime: '20:00', classSlug: 'muay-thai',             coachSlug: 'nadun-silva',       room: 'Main Floor',    capacity: 18 },
    { weekday: 'monday', startTime: '19:00', endTime: '20:30', classSlug: 'bjj-open-mat',          coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 20 },

    // ── Tuesday ──────────────────────────────────────────────────────────────
    { weekday: 'tuesday', startTime: '06:00', endTime: '07:00', classSlug: 'boxing-fundamentals',  coachSlug: 'ashan-perera',      room: 'Boxing Ring',    capacity: 20 },
    { weekday: 'tuesday', startTime: '07:00', endTime: '08:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando', room: 'Weights Floor',  capacity: 16 },
    { weekday: 'tuesday', startTime: '12:00', endTime: '13:00', classSlug: 'bjj-open-mat',          coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 18 },
    { weekday: 'tuesday', startTime: '18:00', endTime: '19:30', classSlug: 'muay-thai',             coachSlug: 'nadun-silva',       room: 'Main Floor',    capacity: 18 },
    { weekday: 'tuesday', startTime: '19:30', endTime: '21:00', classSlug: 'wrestling',             coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 14 },

    // ── Wednesday ────────────────────────────────────────────────────────────
    { weekday: 'wednesday', startTime: '06:00', endTime: '07:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando', room: 'Weights Floor', capacity: 16 },
    { weekday: 'wednesday', startTime: '07:00', endTime: '08:00', classSlug: 'boxing-fundamentals',    coachSlug: 'ashan-perera',     room: 'Boxing Ring',   capacity: 20 },
    { weekday: 'wednesday', startTime: '12:00', endTime: '13:00', classSlug: 'kickboxing',             coachSlug: 'nadun-silva',      room: 'Main Floor',    capacity: 18 },
    { weekday: 'wednesday', startTime: '17:30', endTime: '18:30', classSlug: 'yoga-mobility',          coachSlug: 'kasuni-rathnayake', room: 'Studio',       capacity: 15 },
    { weekday: 'wednesday', startTime: '18:30', endTime: '20:00', classSlug: 'bjj-open-mat',           coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 20 },
    { weekday: 'wednesday', startTime: '19:00', endTime: '20:30', classSlug: 'mma',                    coachSlug: 'nadun-silva',       room: 'Main Floor',   capacity: 14 },

    // ── Thursday ─────────────────────────────────────────────────────────────
    { weekday: 'thursday', startTime: '06:00', endTime: '07:00', classSlug: 'boxing-fundamentals',   coachSlug: 'ashan-perera',      room: 'Boxing Ring',   capacity: 20 },
    { weekday: 'thursday', startTime: '07:00', endTime: '08:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando',  room: 'Weights Floor', capacity: 16 },
    { weekday: 'thursday', startTime: '12:00', endTime: '13:30', classSlug: 'muay-thai',             coachSlug: 'nadun-silva',       room: 'Main Floor',    capacity: 18 },
    { weekday: 'thursday', startTime: '18:00', endTime: '19:00', classSlug: 'kickboxing',            coachSlug: 'nadun-silva',       room: 'Main Floor',    capacity: 18 },
    { weekday: 'thursday', startTime: '19:00', endTime: '20:30', classSlug: 'bjj-open-mat',          coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 20 },

    // ── Friday ───────────────────────────────────────────────────────────────
    { weekday: 'friday', startTime: '06:00', endTime: '07:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando',  room: 'Weights Floor',  capacity: 16 },
    { weekday: 'friday', startTime: '07:00', endTime: '08:00', classSlug: 'boxing-fundamentals',   coachSlug: 'ashan-perera',      room: 'Boxing Ring',    capacity: 20 },
    { weekday: 'friday', startTime: '12:00', endTime: '13:00', classSlug: 'yoga-mobility',         coachSlug: 'kasuni-rathnayake', room: 'Studio',         capacity: 15 },
    { weekday: 'friday', startTime: '17:30', endTime: '19:00', classSlug: 'muay-thai',             coachSlug: 'nadun-silva',       room: 'Main Floor',     capacity: 18 },
    { weekday: 'friday', startTime: '18:30', endTime: '20:00', classSlug: 'mma',                   coachSlug: 'nadun-silva',       room: 'Main Floor',     capacity: 14 },
    { weekday: 'friday', startTime: '19:30', endTime: '21:00', classSlug: 'wrestling',             coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 14 },

    // ── Saturday ─────────────────────────────────────────────────────────────
    { weekday: 'saturday', startTime: '07:00', endTime: '08:30', classSlug: 'boxing-fundamentals',   coachSlug: 'ashan-perera',       room: 'Boxing Ring',    capacity: 24 },
    { weekday: 'saturday', startTime: '08:30', endTime: '10:00', classSlug: 'muay-thai',             coachSlug: 'nadun-silva',        room: 'Main Floor',     capacity: 20 },
    { weekday: 'saturday', startTime: '09:00', endTime: '10:00', classSlug: 'yoga-mobility',         coachSlug: 'kasuni-rathnayake',  room: 'Studio',         capacity: 15 },
    { weekday: 'saturday', startTime: '10:00', endTime: '11:30', classSlug: 'bjj-open-mat',          coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat',  capacity: 22 },
    { weekday: 'saturday', startTime: '11:30', endTime: '12:30', classSlug: 'kickboxing',            coachSlug: 'nadun-silva',        room: 'Main Floor',     capacity: 20 },
    { weekday: 'saturday', startTime: '14:00', endTime: '15:15', classSlug: 'wrestling',             coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat',  capacity: 14 },
    { weekday: 'saturday', startTime: '15:30', endTime: '17:00', classSlug: 'strength-conditioning', coachSlug: 'tharaka-fernando',   room: 'Weights Floor',  capacity: 16 },

    // ── Sunday ───────────────────────────────────────────────────────────────
    { weekday: 'sunday', startTime: '08:00', endTime: '09:00', classSlug: 'yoga-mobility',         coachSlug: 'kasuni-rathnayake',  room: 'Studio',        capacity: 15 },
    { weekday: 'sunday', startTime: '09:00', endTime: '10:30', classSlug: 'bjj-open-mat',          coachSlug: 'chamara-jayasinghe', room: 'Grappling Mat', capacity: 20 },
    { weekday: 'sunday', startTime: '10:30', endTime: '12:00', classSlug: 'boxing-fundamentals',   coachSlug: 'ashan-perera',       room: 'Boxing Ring',   capacity: 20 },
    { weekday: 'sunday', startTime: '10:30', endTime: '12:00', classSlug: 'mma',                   coachSlug: 'nadun-silva',        room: 'Main Floor',    capacity: 14 },
  ];

  // db.query time fields expect HH:mm:ss.SSS format
  const toDbTime = (t: string) => t.length === 5 ? `${t}:00.000` : t;

  let created = 0;
  for (const slot of slots) {
    const classRawId = classRawIds[slot.classSlug];
    const coachRawId = coachRawIds[slot.coachSlug] ?? null;
    if (!classRawId) {
      strapi.log.warn(`[seed] seedSchedule: no raw id for class slug "${slot.classSlug}" — skipping slot`);
      continue;
    }
    await (strapi.db as any).query('api::schedule-slot.schedule-slot').create({
      data: {
        documentId: genDocId(),
        weekday:    slot.weekday,
        startTime:  toDbTime(slot.startTime),
        endTime:    toDbTime(slot.endTime),
        capacity:   slot.capacity,
        room:       slot.room,
        isActive:   true,
        publishedAt: new Date(),
        locale:     null,
        class:      classRawId,
        coach:      coachRawId,
      },
    });
    created++;
  }
  strapi.log.info(`[seed] Created ${created} schedule slots`);
}

// ---------------------------------------------------------------------------
// Pricing tiers + passes
// ---------------------------------------------------------------------------
async function seedPricing(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const tiers = [
    {
      name: 'Starter', slug: 'starter', tagline: 'Your first month, done right.',
      description: 'Designed for newcomers. Two sessions per week across any discipline, open gym access, and beginner-friendly workshops.',
      features: '2 classes per week\nAccess to open gym\nBeginner workshops included\nCoach check-in after week 2\nApp access',
      isMostPopular: false, colour: 'blue', sortOrder: 1,
    },
    {
      name: 'Signature', slug: 'signature', tagline: 'For the committed athlete.',
      description: 'Unlimited classes across all disciplines. Priority booking, monthly progress check-ins, and a full nutrition guide.',
      features: 'Unlimited classes\nPriority class booking\nMonthly progress check-in\nNutrition guide included\nFull app access\nCommunity Slack access',
      isMostPopular: true, colour: 'yellow', sortOrder: 2,
    },
    {
      name: 'Transformation', slug: 'transformation', tagline: 'Elite coaching. Total accountability.',
      description: 'Everything in Signature plus two monthly personal sessions, body composition analysis, a custom training plan, and direct WhatsApp access to your head coach.',
      features: 'Everything in Signature\n2 personal sessions per month\nBody composition analysis\nCustom 12-week training plan\nDirect coach WhatsApp\nPriority tournament support',
      isMostPopular: false, colour: 'red', sortOrder: 3,
    },
  ];

  const tierIds: Record<string, string> = {};
  for (const t of tiers) {
    const c = await docs('api::pricing-tier.pricing-tier').create({ data:t });
    tierIds[t.slug] = c.documentId;
  }

  const passes = [
    { tierSlug: 'starter',        duration: '1 Month',  durationDays: 30,  priceLKR: 9500,  isPurchasable: true, sortOrder: 1 },
    { tierSlug: 'starter',        duration: '3 Months', durationDays: 90,  priceLKR: 26000, isPurchasable: true, sortOrder: 2 },
    { tierSlug: 'signature',      duration: '1 Month',  durationDays: 30,  priceLKR: 16500, isPurchasable: true, sortOrder: 3 },
    { tierSlug: 'signature',      duration: '3 Months', durationDays: 90,  priceLKR: 45000, isPurchasable: true, sortOrder: 4 },
    { tierSlug: 'transformation', duration: '1 Month',  durationDays: 30,  priceLKR: 28000, isPurchasable: true, sortOrder: 5 },
    { tierSlug: 'transformation', duration: '3 Months', durationDays: 90,  priceLKR: 78000, isPurchasable: true, sortOrder: 6 },
  ];

  for (const p of passes) {
    const { tierSlug, ...rest } = p;
    await docs('api::pass.pass').create({
      data: { ...rest, tier: tierIds[tierSlug] ? { documentId: tierIds[tierSlug] } : undefined },
    });
  }
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
async function seedTestimonials(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    { quote: 'The Wolverine Hub changed how I think about training. Not just a gym — it\'s a system.', authorName: 'Kasun M.', authorTitle: 'Member since 2022', rating: 5, isFeatured: true },
    { quote: 'I\'ve trained in Bangkok and KL. This place competes. The boxing programme here is elite.', authorName: 'Rashmi P.', authorTitle: 'Competitive Fighter', rating: 5, isFeatured: true },
    { quote: 'Six months in, 12kg down, genuinely unstoppable. The coaches never let you settle.', authorName: 'Dilnoza A.', authorTitle: 'Transformation Member', rating: 5, isFeatured: true },
    { quote: 'The BJJ programme is world-class. Coach Chamara has competed at the highest level and it shows.', authorName: 'Amila R.', authorTitle: 'BJJ Blue Belt', rating: 5, isFeatured: true },
    { quote: 'Best decision I made in 2024. The community here pushes you in ways no regular gym can.', authorName: 'Sahan W.', authorTitle: 'Signature Member', rating: 5, isFeatured: false },
    { quote: 'The yoga and mobility classes are underrated. My recovery time halved after joining.', authorName: 'Priya N.', authorTitle: 'Yoga & Signature Member', rating: 5, isFeatured: false },
    { quote: 'Coach Tharaka rewired my entire approach to conditioning. The S&C programme is proper sports science.', authorName: 'Danush K.', authorTitle: 'Signature Member', rating: 5, isFeatured: false },
    { quote: 'Tried three gyms in Colombo. Nothing comes close. The coaching quality here is different class.', authorName: 'Naomi S.', authorTitle: 'Kickboxing Member', rating: 5, isFeatured: false },
  ];
  for (const t of list) {
    await docs('api::testimonial.testimonial').create({ data:t });
  }
}

// ---------------------------------------------------------------------------
// FAQ categories
// ---------------------------------------------------------------------------
async function seedFaqCategories(strapi: Core.Strapi): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    { name: 'Getting Started', slug: 'getting-started', sortOrder: 1 },
    { name: 'Membership & Pricing', slug: 'membership-pricing', sortOrder: 2 },
    { name: 'Classes & Training', slug: 'classes-training', sortOrder: 3 },
    { name: 'Facilities & Access', slug: 'facilities-access', sortOrder: 4 },
  ];
  const ids: Record<string, string> = {};
  for (const c of list) {
    const created = await docs('api::faq-category.faq-category').create({ data:c });
    ids[c.slug] = created.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
async function seedFaqs(strapi: Core.Strapi, catIds: Record<string, string>): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const p = (text: string) => [{ type: 'paragraph', children: [{ type: 'text', text }] }];

  const list = [
    // Getting Started
    {
      question: 'Do I need experience to join?',
      answer: p("No experience needed. We have beginner-friendly classes for every discipline. Our coaches will assess your level on arrival and guide you to the right class. Many of our best members started with zero martial arts background."),
      catSlug: 'getting-started', isFeatured: true, sortOrder: 1,
    },
    {
      question: 'What should I bring to my first class?',
      answer: p("Comfortable workout clothing, a water bottle, and a positive mindset. For combat classes, hand wraps are strongly recommended — we sell them at the front desk. Gloves are available to borrow for your first trial session."),
      catSlug: 'getting-started', isFeatured: true, sortOrder: 2,
    },
    {
      question: 'How do I book a free trial?',
      answer: p("Click the 'Book a Free Trial' button on any page. Select a class time, complete a short form, and we'll confirm your spot by WhatsApp within the hour. The trial covers one full class of your choice."),
      catSlug: 'getting-started', isFeatured: true, sortOrder: 3,
    },
    {
      question: 'Is The Wolverine Hub suitable for women?',
      answer: p("Absolutely. Women make up over 40% of our membership. All classes are mixed unless otherwise noted. Our coaches are trained to create an environment that is challenging and respectful for everyone on the mat."),
      catSlug: 'getting-started', isFeatured: false, sortOrder: 4,
    },

    // Membership & Pricing
    {
      question: 'Are there lock-in contracts?',
      answer: p("No lock-ins. All passes are month-to-month. Cancel anytime via your member dashboard or by WhatsApp. Three-month passes offer a discount but are still cancellable after the first month with no penalty."),
      catSlug: 'membership-pricing', isFeatured: true, sortOrder: 5,
    },
    {
      question: 'What is the difference between Starter, Signature, and Transformation?',
      answer: p("Starter gives you 2 classes per week — ideal for people starting out. Signature is unlimited classes with priority booking and monthly progress check-ins, designed for members training 4–5× per week. Transformation adds personal sessions, body composition analysis, a custom training plan, and direct coach access for those who want elite accountability."),
      catSlug: 'membership-pricing', isFeatured: true, sortOrder: 6,
    },
    {
      question: 'Can I freeze my membership?',
      answer: p("Yes. Members can freeze their pass for up to 30 days per year at no cost — useful for travel or injury. To freeze, message us on WhatsApp at least 3 days before your billing date."),
      catSlug: 'membership-pricing', isFeatured: false, sortOrder: 7,
    },
    {
      question: 'Do you offer student or corporate discounts?',
      answer: p("We offer a 10% student discount on Starter and Signature passes with a valid student ID. Corporate rates are available for companies placing 5 or more members — contact us directly for a quote."),
      catSlug: 'membership-pricing', isFeatured: false, sortOrder: 8,
    },

    // Classes & Training
    {
      question: 'How many classes can I attend per week on Signature?',
      answer: p("Unlimited. On Signature you can attend as many classes as you like across all disciplines. Priority booking applies — you get earlier access to slots before Starter members, ensuring you always get your preferred time."),
      catSlug: 'classes-training', isFeatured: false, sortOrder: 9,
    },
    {
      question: 'Is sparring mandatory?',
      answer: p("Never. Sparring is always optional and introduced only when the coach assesses you are technically ready — typically after 3–6 months of consistent training depending on the discipline. You will never be pressured to spar before you are ready."),
      catSlug: 'classes-training', isFeatured: false, sortOrder: 10,
    },
    {
      question: 'Can I train multiple disciplines?',
      answer: p("Yes — and we actively encourage it. Many of our members combine Boxing or Muay Thai with BJJ and S&C. Your coach can help you build a weekly schedule that develops multiple disciplines without overtraining."),
      catSlug: 'classes-training', isFeatured: false, sortOrder: 11,
    },

    // Facilities
    {
      question: 'Where are you located?',
      answer: p("We are at 42 Duplication Road, Colombo 03. Parking is available in the building basement. We are a 5-minute walk from the Kollupitiya train station and served by multiple bus routes along Duplication Road."),
      catSlug: 'facilities-access', isFeatured: false, sortOrder: 12,
    },
    {
      question: 'What are your opening hours?',
      answer: p("Monday to Friday: 5:30 AM – 10:00 PM. Saturday: 6:30 AM – 8:00 PM. Sunday: 7:30 AM – 3:00 PM. Class schedules run within these hours. Open gym access is available during all operating hours."),
      catSlug: 'facilities-access', isFeatured: false, sortOrder: 13,
    },
  ];

  for (const faq of list) {
    const { catSlug, ...rest } = faq;
    await docs('api::faq.faq').create({
      data: {
        ...rest,
        category: catIds[catSlug] ? { documentId: catIds[catSlug] } : undefined,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------
async function seedAuthors(strapi: Core.Strapi): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    {
      name: 'Ashan Perera', slug: 'ashan-perera',
      bio: 'Head Boxing Coach at The Wolverine Hub. National champion. 12 years coaching elite amateur fighters.',
    },
    {
      name: 'The Wolverine Hub', slug: 'the-wolverine-hub',
      bio: 'The editorial team at The Wolverine Hub. Training guides, community spotlights, and everything inside the gym.',
    },
  ];
  const ids: Record<string, string> = {};
  for (const a of list) {
    const c = await docs('api::author.author').create({ data:a });
    ids[a.slug] = c.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Post categories
// ---------------------------------------------------------------------------
async function seedPostCategories(strapi: Core.Strapi): Promise<Record<string, string>> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    { name: 'Training Tips',       slug: 'training-tips' },
    { name: 'Fighter Spotlights',  slug: 'fighter-spotlights' },
    { name: 'Nutrition',           slug: 'nutrition' },
    { name: 'Inside The Hub',      slug: 'inside-the-hub' },
  ];
  const ids: Record<string, string> = {};
  for (const c of list) {
    const created = await docs('api::post-category.post-category').create({ data:c });
    ids[c.slug] = created.documentId;
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------
async function seedPosts(
  strapi: Core.Strapi,
  authorIds: Record<string, string>,
  catIds: Record<string, string>,
): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const list = [
    {
      title: 'Why Boxing Fundamentals Is the Best First Class You Can Take',
      slug: 'why-boxing-fundamentals-best-first-class',
      summary: 'Most people walk into a gym and head straight for the heavy bag. Here\'s why starting with technique will accelerate your progress across every discipline.',
      authorSlug: 'ashan-perera',
      catSlug: 'training-tips',
      tags: 'boxing\nbeginners\ntechnique\nfundamentals',
      readingTimeMinutes: 5,
      isFeatured: true,
      content: [
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'The Temptation to Go Hard Immediately' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Every new member wants to jump straight into sparring. I understand it — you've watched fights, you've seen the highlight reels, and you want to know if you've got what it takes. But here's what 12 years of coaching has taught me: the fastest way to get good is to slow down first." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Boxing Fundamentals exists specifically for this reason. It\'s not a watered-down version of boxing. It\'s where the real work happens.' }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'What You Actually Learn in the First Month' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "In the first four weeks, we focus on four things: stance, footwork, the jab, and the cross. That's it. Not because there's nothing else — but because everything else in boxing grows from these four roots." }] },
        { type: 'list', format: 'unordered', children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Stance: where your weight sits, how your feet are positioned, and why this protects you before you throw a single punch.' }] },
          { type: 'list-item', children: [{ type: 'text', text: "Footwork: the most underrated skill in all of martial arts. Fighters who can't move can't fight. Period." }] },
          { type: 'list-item', children: [{ type: 'text', text: 'The jab: the most important punch in boxing. Fast, efficient, and the foundation of every combination you\'ll ever throw.' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'The cross: power generation from the hips and the follow-through that makes the jab land harder.' }] },
        ]},
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Why Technique Beats Aggression Every Time' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "I've watched more technically sound fighters with three months' training dismantle aggressive gym warriors who've been swinging for years. Technique compounds. Raw aggression plateaus. If you want to still be improving in year three, build the foundation now." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Come with an open mind, comfortable clothing, and hand wraps. Everything else we provide.' }] },
      ],
    },
    {
      title: 'The Athlete\'s Guide to Recovery: What Happens the Day After Training',
      slug: 'athletes-guide-recovery-day-after-training',
      summary: 'You trained hard yesterday. Your muscles ache, your hands are wrapped, and your brain wants to go again. Should you? Coach Kasuni breaks down the science of recovery.',
      authorSlug: 'the-wolverine-hub',
      catSlug: 'training-tips',
      tags: 'recovery\nyoga\nmobility\nsports science\ninjury prevention',
      readingTimeMinutes: 7,
      isFeatured: false,
      content: [
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'The Myth of "More is More"' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "The hardest thing to teach competitive athletes isn't a technique or a movement pattern. It's rest. Most fighters equate rest with weakness — but rest is where adaptation happens. You don't get stronger during a session. You get stronger during the recovery from it." }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'The 48-Hour Window' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'After a high-intensity session — sparring, hard Muay Thai, heavy S&C — your muscles are inflamed, glycogen-depleted, and your central nervous system is taxed. The body needs 48–72 hours to repair fully. Training the same muscle groups in this window does not accelerate progress. It interrupts the repair cycle.' }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'What Active Recovery Actually Means' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Active recovery doesn't mean sitting on the couch. It means low-intensity movement that promotes blood flow without additional muscle damage. This is exactly what our Sunday morning Yoga & Mobility class is designed for." }] },
        { type: 'list', format: 'unordered', children: [
          { type: 'list-item', children: [{ type: 'text', text: 'Light walking or swimming (20–30 minutes, conversational pace)' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Yoga or mobility work — targets the specific tightness patterns fighters develop' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Contrast shower therapy — alternating hot and cold to promote circulation' }] },
          { type: 'list-item', children: [{ type: 'text', text: 'Foam rolling — reduces DOMS and improves range of motion for the next session' }] },
        ]},
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Sleep Is Your Most Powerful Recovery Tool' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "No supplement, no cold plunge, no massage gun replaces sleep. 7–9 hours of quality sleep is where growth hormone peaks, tissue repairs, and motor patterns consolidate. If you're training 5 days a week and sleeping 5 hours a night, your programme is working against itself." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Our Yoga & Mobility class runs every Sunday morning and twice weekly in the evenings. No martial arts experience required. Just show up sore.' }] },
      ],
    },
    {
      title: 'Fuelling for Fight Camp: What to Eat When Training Twice a Day',
      slug: 'fuelling-for-fight-camp-what-to-eat',
      summary: 'Double sessions demand double the nutritional attention. Here is a practical framework for eating around high-volume martial arts training without overcomplicating it.',
      authorSlug: 'the-wolverine-hub',
      catSlug: 'nutrition',
      tags: 'nutrition\nfight camp\nmeal prep\nenergy\ncombat sports',
      readingTimeMinutes: 8,
      isFeatured: false,
      content: [
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Calories First, Everything Else Second' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Before we talk macros, protein timing, or supplements — the first and most common mistake athletes make is under-eating. Two sessions a day burns anywhere from 900 to 1,400 kcal above your baseline. If you're not eating enough to replace that, your body has one option: break down muscle." }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Use a TDEE calculator as a starting point, add your training volume, and add 200–300 kcal for muscle-building buffer. Track for two weeks. Adjust based on weight trend and energy levels." }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'The Pre-Session Window' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Eat a carbohydrate-led meal 90–120 minutes before your session. The goal is available glycogen — not a full stomach. A good formula: 1g of carbs per kg of bodyweight, with moderate protein (20–30g) and minimal fat.' }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Post-Session: The Repair Window' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "The 30–60 minutes after a session is the most important eating window of the day. Your muscles are primed to absorb nutrients. Target 30–40g of fast-digesting protein (whey, eggs, or Greek yoghurt) and 50–80g of quick carbohydrates (white rice, banana, or a sports drink)." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'For morning sessions followed by an evening session, what you eat between the two determines your performance in session two. Do not skip a full meal between double sessions.' }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'What About Supplements?' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Creatine monohydrate is the only supplement with consistent peer-reviewed evidence for combat sports performance — 3–5g daily. Whey protein is a convenient food, not a magic product. Everything else is secondary to sleep, whole food calories, and training consistency." }] },
      ],
    },
    {
      title: 'Inside The Wolverine Hub: How We Built Colombo\'s Most Demanding Gym',
      slug: 'inside-the-wolverine-hub-how-we-built-it',
      summary: 'From a rented warehouse with two heavy bags to a full-facility combat sports centre. The story of how The Wolverine Hub was built — and why we never compromised on the coaching standard.',
      authorSlug: 'the-wolverine-hub',
      catSlug: 'inside-the-hub',
      tags: 'origin story\nColombo\ncombat sports\ncoaching culture',
      readingTimeMinutes: 6,
      isFeatured: false,
      content: [
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'A Warehouse and Two Bags' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "The Wolverine Hub started in 2019 in a 1,200 sq ft rented warehouse space on Baseline Road. There were two heavy bags, a set of kettle bells, and one coach — Ashan. Twelve people trained in that first month. Ten of them are still members today." }] },
        { type: 'paragraph', children: [{ type: 'text', text: "What we had wasn't space or equipment. It was a standard. A way of coaching that refused to water anything down. A belief that Sri Lankan athletes deserved access to the same quality of training that professional fighters in Bangkok, London, and New York were getting." }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'The Non-Negotiable: Coaching Quality First' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Every coach at The Wolverine Hub holds a legitimate international certification in their discipline. Every coach has either competed or spent significant time training in their field's home environment — Thailand for Muay Thai, Brazil for BJJ." }] },
        { type: 'paragraph', children: [{ type: 'text', text: "We turned down 11 coaches before hiring our first five. Not because they weren't good people — but because the standard isn't negotiable." }] },
        { type: 'heading', level: 2, children: [{ type: 'text', text: 'Where We Are Now' }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Today we operate from a purpose-built 8,500 sq ft facility on Duplication Road in Colombo 03. The space includes a regulation boxing ring, a dedicated BJJ grappling room, a fully-equipped S&C floor, a recovery studio, and changing rooms that don't shame the training that happens around them." }] },
        { type: 'paragraph', children: [{ type: 'text', text: "Over 1,200 active members train here weekly across 8 disciplines. That warehouse on Baseline Road isn't forgotten — it's the standard reminder that what we build is less important than how we coach." }] },
      ],
    },
  ];

  for (const post of list) {
    const { authorSlug, catSlug, ...rest } = post;
    await docs('api::post.post').create({
      data: {
        ...rest,
        author:   authorIds[authorSlug]   ? { documentId: authorIds[authorSlug] }   : undefined,
        category: catIds[catSlug]         ? { documentId: catIds[catSlug] }         : undefined,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Amenities
// ---------------------------------------------------------------------------
async function seedAmenities(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    { name: 'Regulation Boxing Ring', sortOrder: 1 },
    { name: 'Dedicated Grappling Room', sortOrder: 2 },
    { name: 'Full S&C Weights Floor', sortOrder: 3 },
    { name: 'Recovery & Yoga Studio', sortOrder: 4 },
    { name: 'Changing Rooms & Showers', sortOrder: 5 },
    { name: 'Basement Parking', sortOrder: 6 },
    { name: 'Pro Shop', sortOrder: 7 },
    { name: 'Member Lounge', sortOrder: 8 },
  ];
  for (const a of list) {
    await docs('api::amenity.amenity').create({ data:a });
  }
}

// ---------------------------------------------------------------------------
// Legal pages
// ---------------------------------------------------------------------------
async function seedLegalPages(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const p = (text: string) => [{ type: 'paragraph', children: [{ type: 'text', text }] }];
  const h2 = (text: string) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] });

  await docs('api::legal-page.legal-page').create({
    data: {
      title: 'Privacy Policy',
      slug: 'privacy',
      lastUpdated: '2025-01-01',
      content: [
        h2('1. Information We Collect'),
        ...p('We collect information you provide directly to us when you register as a member, book a class, purchase a pass, or contact us. This includes your name, email address, phone number, and payment information.'),
        h2('2. How We Use Your Information'),
        ...p('We use the information we collect to provide, maintain, and improve our services, process transactions, send you promotional communications (with your consent), and comply with legal obligations.'),
        h2('3. Information Sharing'),
        ...p('We do not sell, trade, or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.'),
        h2('4. Data Security'),
        ...p('We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction.'),
        h2('5. Your Rights'),
        ...p('You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at hello@thewolverinehub.com.'),
        h2('6. Contact'),
        ...p('If you have questions about this Privacy Policy, please contact us at hello@thewolverinehub.com or write to us at 42 Duplication Road, Colombo 03, Sri Lanka.'),
      ],
      seo: {
        metaTitle: 'Privacy Policy — The Wolverine Hub',
        metaDescription: 'How The Wolverine Hub collects, uses, and protects your personal information.',
      },
    },
  });

  await docs('api::legal-page.legal-page').create({
    data: {
      title: 'Terms of Use',
      slug: 'terms',
      lastUpdated: '2025-01-01',
      content: [
        h2('1. Acceptance of Terms'),
        ...p('By accessing or using The Wolverine Hub website or facilities, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.'),
        h2('2. Membership and Passes'),
        ...p('Passes are non-transferable and valid only for the named member. All sales are final unless a medical certificate is provided within 7 days of purchase. Month-to-month passes may be cancelled with 14 days notice.'),
        h2('3. Code of Conduct'),
        ...p('All members and visitors must conduct themselves in a respectful manner. Aggressive, discriminatory, or threatening behaviour will result in immediate removal and membership termination without refund.'),
        h2('4. Health and Safety'),
        ...p('Members participate in all activities at their own risk. You must inform your coach of any existing injuries or medical conditions before training. The Wolverine Hub is not liable for injuries sustained during normal training activities.'),
        h2('5. Intellectual Property'),
        ...p('All content on this website including text, graphics, logos, and images is the property of The Wolverine Hub and may not be reproduced without written permission.'),
        h2('6. Governing Law'),
        ...p('These Terms of Use are governed by the laws of Sri Lanka. Any disputes shall be subject to the exclusive jurisdiction of the courts of Colombo.'),
      ],
      seo: {
        metaTitle: 'Terms of Use — The Wolverine Hub',
        metaDescription: 'The terms and conditions governing use of The Wolverine Hub website and membership services.',
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------
async function seedPrograms(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;
  const list = [
    {
      name: 'Starter Program', slug: 'starter-program',
      tagline: 'Your first 30 days, structured.',
      shortDescription: 'A guided introduction to martial arts training for complete beginners. Two sessions per week, beginner workshops, and a coach check-in at week 2.',
      fromPrice: 9500, currency: 'LKR', minimumCommitment: '1 month',
      isFeatured: false, sortOrder: 1,
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: "The Starter Program is designed specifically for people who have never trained martial arts before. We pair you with the right class, the right coach, and give you a structured 30-day pathway to build confidence and technique." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Two sessions per week. Access to beginner workshops. A coach check-in call at the end of week 2 to make sure you\'re on the right track.' }] },
      ],
    },
    {
      name: 'Signature Program', slug: 'signature-program',
      tagline: 'For the committed athlete.',
      shortDescription: 'Unlimited classes, priority booking, monthly progress check-ins, and a nutrition guide. Designed for members training 4–5× per week.',
      fromPrice: 16500, currency: 'LKR', minimumCommitment: '1 month',
      isFeatured: true, sortOrder: 2,
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: 'Signature is our most popular programme and the one we recommend for anyone serious about consistent improvement. Unlimited access means you train as much as your body will allow.' }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'A monthly check-in with your coach tracks progress, adjusts your training split, and ensures you\'re moving toward your goals at the right pace.' }] },
      ],
    },
    {
      name: 'Transformation Program', slug: 'transformation-program',
      tagline: 'Elite coaching. Total accountability.',
      shortDescription: 'Unlimited classes plus two monthly personal sessions, body composition analysis, a custom training plan, and direct WhatsApp access to your head coach.',
      fromPrice: 28000, currency: 'LKR', minimumCommitment: '1 month',
      isFeatured: false, sortOrder: 3,
      description: [
        { type: 'paragraph', children: [{ type: 'text', text: "Transformation is for members who want more than a gym membership. You get the full coaching relationship — regular assessment, a periodised plan written for you specifically, and the accountability of a personal coach." }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Used by competitive athletes, people with specific body composition goals, and anyone who wants to compress years of progress into months.' }] },
      ],
    },
  ];
  for (const prog of list) {
    await docs('api::program.program').create({ data:prog });
  }
}

// ---------------------------------------------------------------------------
// Home page — upsert so re-runs on version bump replace old sections
// ---------------------------------------------------------------------------
async function seedHomePage(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const homeData = {
    title: 'Home',
    slug: 'home',
    sections: [
      {
        __component: 'sections.hero-video',
        headline: 'Where Iron Meets Instinct.',
        subheadline: "Sri Lanka's most demanding training ground. Classes, coaching and programs built for those who mean it.",
        primaryCta:   { label: 'Book a Free Trial', href: '/free-trial', variant: 'primary', openInNewTab: false },
        secondaryCta: { label: 'Explore Classes',   href: '/classes',    variant: 'ghost',   openInNewTab: false },
        visible: true, anchorId: 'hero',
      },
      {
        __component: 'sections.stat-counters',
        stats: [
          { number: '24+',    label: 'Disciplines' },
          { number: '1,200+', label: 'Active Members' },
          { number: '18',     label: 'Expert Coaches' },
          { number: '5',      label: 'Years Strong' },
        ],
        visible: true, anchorId: 'stats',
      },
      {
        __component: 'sections.marquee',
        items: ['Boxing', 'Muay Thai', 'Brazilian Jiu-Jitsu', 'Kickboxing', 'Strength & Conditioning', 'Wrestling', 'MMA', 'Yoga & Mobility', 'HIIT', 'Calisthenics'],
        speed: 'normal', visible: true,
      },
      {
        __component: 'sections.class-rail',
        heading: 'Every Discipline. Every Level.',
        cta: { label: 'All Classes', href: '/classes', variant: 'ghost', openInNewTab: false },
        visible: true, anchorId: 'classes',
      },
      {
        __component: 'sections.program-tiers',
        heading: 'Programs Built for Results.',
        subheading: 'Every programme is structured, coach-led, and designed to take you somewhere specific.',
        cta: { label: 'All Programs', href: '/programs', variant: 'primary', openInNewTab: false },
        visible: true, anchorId: 'programs',
      },
      {
        __component: 'sections.coach-spotlight',
        heading: 'Meet the Head Coach.',
        cta: { label: 'All Coaches', href: '/coaches', variant: 'ghost', openInNewTab: false },
        visible: true, anchorId: 'coaches',
      },
      {
        __component: 'sections.pricing-teaser',
        heading: 'Simple, Honest Pricing.',
        subheading: 'Pick a tier. Book your first class. No lock-ins.',
        cta: { label: 'See All Plans', href: '/pricing', variant: 'primary', openInNewTab: false },
        visible: true, anchorId: 'pricing',
      },
      {
        __component: 'sections.testimonial-slider',
        heading: 'The Members Speak.',
        maxItems: 6,
        visible: true, anchorId: 'testimonials',
      },
      {
        __component: 'sections.cta-banner',
        heading: 'Ready to Start?',
        subheading: 'Your first class is on us. No excuses. No delays.',
        primaryCta:   { label: 'Book a Free Trial', href: '/free-trial', variant: 'primary', openInNewTab: false },
        secondaryCta: { label: 'View Pricing',      href: '/pricing',    variant: 'ghost',   openInNewTab: false },
        backgroundToken: 'red', visible: true, anchorId: 'cta',
      },
    ],
    seo: {
      metaTitle: 'The Wolverine Hub — Where Iron Meets Instinct',
      metaDescription: "Sri Lanka's most demanding training ground. 24+ disciplines. Elite coaches. Classes for every level. Book your free trial today.",
    },
  };

  // Upsert: update existing home page if it exists, otherwise create it fresh.
  const existing = await docs('api::page.page').findFirst({
    filters: { slug: 'home' },
  });

  if (existing?.documentId) {
    await docs('api::page.page').update({
      documentId: existing.documentId,
      data: homeData,
    });
    strapi.log.info('[bootstrap] Home page sections updated (upsert)');
  } else {
    await docs('api::page.page').create({ data: homeData });
    strapi.log.info('[bootstrap] Home page created');
  }
}

// ---------------------------------------------------------------------------
// Publish all draft documents
// ---------------------------------------------------------------------------
async function publishAllContent(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  const singleTypes = [
    'api::global.global', 'api::header.header',
    'api::footer.footer', 'api::ui-strings.ui-strings',
  ];

  // pass excluded — its tier relation can be orphaned, which breaks publish
  const collections = [
    'api::page.page', 'api::class.class', 'api::discipline.discipline',
    'api::coach.coach', 'api::pricing-tier.pricing-tier',
    'api::testimonial.testimonial', 'api::faq.faq', 'api::faq-category.faq-category',
    'api::schedule-slot.schedule-slot', 'api::author.author',
    'api::post-category.post-category', 'api::post.post',
    'api::amenity.amenity', 'api::legal-page.legal-page', 'api::program.program',
  ];

  let published = 0;
  for (const uid of singleTypes) {
    try {
      const draft = await docs(uid).findFirst({ status: 'draft' });
      if (draft) { await docs(uid).publish({ documentId: draft.documentId }); published++; }
    } catch { /* already published or broken relation — skip */ }
  }
  for (const uid of collections) {
    try {
      const drafts = await docs(uid).findMany({ status: 'draft', limit: 200 });
      for (const draft of drafts) {
        try {
          await docs(uid).publish({ documentId: draft.documentId }); published++;
        } catch { /* skip items with broken relations */ }
      }
    } catch { /* content type not queryable — skip */ }
  }

  strapi.log.info(`[seed] Published ${published} draft documents`);
}

// ---------------------------------------------------------------------------
// Inner pages (all routes except home) — idempotent
// ---------------------------------------------------------------------------
async function seedInnerPages(strapi: Core.Strapi): Promise<void> {
  const docs = strapi.documents as (uid: string) => any;

  // Fetch existing page slugs so we skip pages already in the DB
  const existing: any[] = await (strapi.db as any).query('api::page.page').findMany({ limit: 50 });
  const existingSlugs = new Set(existing.map((p: any) => p.slug));

  const pages = [
    {
      title: 'Classes', slug: 'classes',
      hero: { eyebrow: 'Train', heading: 'Every Discipline.\nEvery Level.', subheading: 'From your first session to your hundredth fight — we have a class built for where you are right now.' },
      seo: { metaTitle: 'Classes — The Wolverine Hub', metaDescription: '24+ martial arts and fitness disciplines for every level. Boxing, Muay Thai, BJJ, Strength, and more.' },
    },
    {
      title: 'Coaches', slug: 'coaches',
      hero: { eyebrow: 'Expertise', heading: 'Train With\nThe Best.', subheading: 'Every coach at The Wolverine Hub has competed, won, and still trains. No ex-gym rats, no online certificates.' },
      seo: { metaTitle: 'Coaches — The Wolverine Hub', metaDescription: 'Meet the coaches. Every one has competed, won, and still trains.' },
    },
    {
      title: 'Pricing', slug: 'pricing',
      hero: { eyebrow: 'Membership', heading: 'Simple,\nHonest Pricing.', subheading: 'Pick your tier. Book your first class. No hidden fees, no lock-in contracts.' },
      seo: { metaTitle: 'Pricing — The Wolverine Hub', metaDescription: 'Passes, tokens, and add-ons. No hidden fees, no lock-in contracts.' },
    },
    {
      title: 'Schedule', slug: 'schedule',
      hero: { eyebrow: 'Timetable', heading: 'Weekly\nSchedule.', subheading: 'Classes run seven days a week. Pick a day and find your next session.' },
      seo: { metaTitle: 'Schedule — The Wolverine Hub', metaDescription: 'Weekly class timetable. Seven days a week. Find your next session.' },
    },
    {
      title: 'Programs', slug: 'programs',
      hero: { eyebrow: 'Programs', heading: 'Train With\nPurpose.', subheading: 'Three tiers. One standard: excellence. Pick the program that matches where you are — and where you\'re going.' },
      seo: { metaTitle: 'Programs — The Wolverine Hub', metaDescription: 'Starter, Signature, and Transformation programs. Structured training for every ambition.' },
    },
    {
      title: 'Gallery', slug: 'gallery',
      hero: { eyebrow: 'Gallery', heading: 'Inside\nThe Hub.', subheading: 'Real training. Real athletes. No poses, no filters.' },
      seo: { metaTitle: 'Gallery — The Wolverine Hub', metaDescription: 'Photos from inside The Wolverine Hub. Real training, real athletes.' },
    },
    {
      title: 'Blog', slug: 'blog',
      hero: { eyebrow: 'Journal', heading: 'Inside\nThe Hub.', subheading: 'Training guides, fighter spotlights, nutrition, and stories from inside The Wolverine Hub.' },
      seo: { metaTitle: 'Blog — The Wolverine Hub', metaDescription: 'Training guides, fighter spotlights, nutrition, and stories from inside The Wolverine Hub.' },
    },
    {
      title: 'FAQ', slug: 'faq',
      hero: { eyebrow: 'FAQ', heading: 'Got\nQuestions?', subheading: 'Everything you need to know before you walk through the door.' },
      seo: { metaTitle: 'FAQ — The Wolverine Hub', metaDescription: 'Answers to common questions about classes, membership, and training at The Wolverine Hub.' },
    },
    {
      title: 'Contact', slug: 'contact',
      hero: { eyebrow: 'Get In Touch', heading: 'Start Here.', subheading: 'Questions, free trial bookings, or just want to know if this place is right for you — send us a message.' },
      seo: { metaTitle: 'Contact — The Wolverine Hub', metaDescription: 'Get in touch. Book a free trial or ask us anything.' },
    },
  ];

  let created = 0;
  for (const page of pages) {
    if (existingSlugs.has(page.slug)) continue; // already exists — skip

    await docs('api::page.page').create({
      data: {
        title: page.title,
        slug: page.slug,
        sections: [
          {
            __component: 'sections.page-hero',
            eyebrow: page.hero.eyebrow,
            heading: page.hero.heading,
            subheading: page.hero.subheading,
          },
        ],
        seo: page.seo,
      },
    });
    created++;
  }
  if (created > 0) strapi.log.info(`[seed] Created ${created} inner page(s)`);
}
