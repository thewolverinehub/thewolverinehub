/**
 * Catalog v2 — the "pay per class" pivot (2026-10).
 *
 * One-time, idempotent content migration. It:
 *   • replaces the placeholder coaches with the real ones (Malshan, Amanda)
 *   • replaces ALL classes + weekly schedule slots with the 12 classes from the client's sheet
 *     (price per session, capacity, days) plus dummy times, program details, targets, equipment
 *   • removes Programs and the monthly pricing tiers / passes
 *   • rewrites FAQs for the new model, fixes testimonials / blog mentions
 *   • updates header, footer, redirects and the home page (Programs + pricing teaser out,
 *     "Our Story" in)
 *
 * After it succeeds a flag is stored and the legacy seeder never touches content again —
 * from here on the CMS (the client) owns the content.
 */
import type { Core } from '@strapi/strapi';

type Docs = (uid: string) => any;

const block = (text: string) => ({ type: 'paragraph', children: [{ type: 'text', text }] });
const blocks = (...texts: string[]) => texts.map(block);

// ── Coaches ──────────────────────────────────────────────────────────────────
const COACHES = [
  {
    slug: 'malshan',
    name: 'Malshan Jayasekara',
    nickname: 'The Wolverine',
    role: 'Head Coach & Founder',
    shortBio: 'Fights under the ring name “The Wolverine”. Boxing, MMA, strength and elite athlete coach.',
    bio: blocks(
      'Malshan carries the ring name “The Wolverine” — and brings the same intensity to every session on the floor. He leads The Wolverine Hub’s strength, boxing, MMA, hybrid and athlete-development programmes.',
      'His coaching is structured and demanding: fundamentals first, then pressure-testing them. Whether you are lifting your first barbell or preparing for your next fight, every class is built so you leave better than you arrived.',
      'Malshan personally guides the Elite Champion programme, grooming general athletes into elite-level competitors.',
    ),
    specialties: 'Boxing\nMMA\nStrength training\nHybrid race preparation\nAthlete development',
    yearsExperience: 12,
    instagram: 'thewolverinehub',
    isHeadCoach: true,
    sortOrder: 1,
  },
  {
    slug: 'amanda',
    name: 'Amanda',
    nickname: null,
    role: 'Hybrid & Running Coach',
    shortBio: 'Hybrid fitness and running coach. Leads the free Saturday Easy Run.',
    bio: blocks(
      'Amanda coaches hybrid training, running and movement. She co-leads the station-based hybrid classes and runs the free Saturday Easy Run, helping members build an aerobic base they can rely on.',
      'Her sessions are about rhythm, efficiency and consistency — perfect if you are preparing for HYROX, a 10K or simply want to feel fitter every week.',
    ),
    specialties: 'Hybrid training\nRunning technique\nAerobic base building\nAnimal Flow & mobility\nSenior fitness',
    yearsExperience: 8,
    instagram: 'thewolverinehub',
    isHeadCoach: false,
    sortOrder: 2,
  },
];

// ── Classes (client sheet + dummy extras) ───────────────────────────────────
type Day = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
interface SlotDef { days: Day[]; start: string; end: string; room: string }
interface ClassDef {
  slug: string; name: string; tagline: string; frequency: string; price: number; duration: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme'; coaches: string[]; capacity: number;
  description: string[]; targetAreas: string[]; equipment: string[]; slots: SlotDef[];
}
const WEEK: Day[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

const CLASSES: ClassDef[] = [
  {
    slug: 'colossus', name: 'Colossus', tagline: 'Strength Training', frequency: '3 days per week', price: 3000, duration: 75,
    intensity: 'high', coaches: ['malshan'], capacity: 6,
    description: ['Focused on unleashing your inner strength, from basic movements to Olympic lifts. Each session is built on compound lifts that lead you to master the art of lifting barbells, dumbbells and kettlebells, under the supervision of an expert coach and in a supportive community.'],
    targetAreas: ['Legs & glutes', 'Back & posterior chain', 'Chest, shoulders & arms', 'Core stability', 'Full-body strength'],
    equipment: ['Barbells', 'Dumbbells', 'Kettlebells', 'Squat racks', 'Weight plates'],
    slots: [{ days: ['monday', 'wednesday', 'friday'], start: '06:00', end: '07:15', room: 'Weights Floor' }],
  },
  {
    slug: 'oh-sht', name: 'Oh Sh*t', tagline: 'Hybrid Training', frequency: '1 day per week', price: 3000, duration: 75,
    intensity: 'extreme', coaches: ['malshan', 'amanda'], capacity: 8,
    description: ['A station-based programme to challenge your overall fitness and your ability to survive on dual-demand hybrid energy systems. Specifically designed for members planning to compete in hybrid races like HYROX, ATHX, SPARTAN, DEKA FIT, YODHA and more.'],
    targetAreas: ['Cardio engine', 'Muscular endurance', 'Running economy', 'Full-body power', 'Transitions between stations'],
    equipment: ['Sleds', 'Rowers & ski-ergs', 'Sandbags', 'Kettlebells', 'Wall balls', 'Assault bikes'],
    slots: [{ days: ['thursday'], start: '06:00', end: '07:15', room: 'Main Floor' }],
  },
  {
    slug: 'bumble-bee', name: 'Bumble Bee', tagline: 'Aerobic Fitness', frequency: '1 day per week', price: 3000, duration: 60,
    intensity: 'medium', coaches: ['malshan'], capacity: 8,
    description: ['A programme designed to build your engine. Aerobic base, pyramid-style stations to boost your confidence and endurance.'],
    targetAreas: ['Aerobic base', 'Heart & lung capacity', 'Endurance', 'Recovery capacity'],
    equipment: ['Rowers', 'Assault bikes', 'Skipping ropes', 'Dumbbells', 'Mats'],
    slots: [{ days: ['tuesday'], start: '06:00', end: '07:00', room: 'Main Floor' }],
  },
  {
    slug: 'asterix', name: 'Asterix', tagline: 'Lactate Threshold', frequency: '1 day per week', price: 3000, duration: 60,
    intensity: 'extreme', coaches: ['malshan'], capacity: 8,
    description: ['A challenging routine that pushes you to your maximum limits to build lactate threshold and VO2 max. It will challenge you to optimise your overall fitness and burn a big chunk of calories in a short period of time.'],
    targetAreas: ['Lactate threshold', 'VO2 max', 'Full-body conditioning', 'Calorie burn'],
    equipment: ['Assault bikes', 'Rowers', 'Battle ropes', 'Kettlebells', 'Heart-rate monitors'],
    slots: [{ days: ['friday'], start: '17:00', end: '18:00', room: 'Main Floor' }],
  },
  {
    slug: 'makkari', name: 'Makkari', tagline: 'Easy Run', frequency: '1 day per week', price: 0, duration: 60,
    intensity: 'low', coaches: ['amanda'], capacity: 12,
    description: ['A free class for Zone 2 — an easy run at your own conversational pace in different locations. This develops your aerobic capacity, and our coaches will guide you to perfect your movement, rhythm and endurance.'],
    targetAreas: ['Aerobic capacity', 'Running form', 'Cadence & rhythm', 'Endurance'],
    equipment: ['Running shoes', 'Water bottle'],
    slots: [{ days: ['saturday'], start: '06:00', end: '07:00', room: 'Different locations (announced weekly)' }],
  },
  {
    slug: 'primal', name: 'Primal', tagline: 'Crossfit & Animal Flow', frequency: '1 day per week', price: 3000, duration: 75,
    intensity: 'high', coaches: ['malshan', 'amanda'], capacity: 6,
    description: ['From beginner to pro, Primal offers CrossFit workouts and teaches you the mobility to experience the maximum flow of your body. Workouts vary with the CrossFit manual, and animal movements are used to master myofascial activation and movement patterns.'],
    targetAreas: ['Full-body strength', 'Mobility & flexibility', 'Myofascial activation', 'Movement patterns', 'Core'],
    equipment: ['Barbells', 'Gymnastic rings', 'Kettlebells', 'Plyo boxes', 'Mats'],
    slots: [{ days: ['friday'], start: '18:30', end: '19:45', room: 'Studio' }],
  },
  {
    slug: 'dalsim', name: 'Dalsim', tagline: 'Vinyasa Flow Yoga', frequency: '1 day per week', price: 3000, duration: 75,
    intensity: 'low', coaches: [], capacity: 6,
    description: ['Yoga and breathwork practices to improve flexibility, release tension, calm your nervous system and your mind, and use the breath to manage your stress.'],
    targetAreas: ['Flexibility', 'Breath control', 'Stress & nervous system', 'Hips & spine'],
    equipment: ['Yoga mats (provided)', 'Blocks', 'Straps'],
    slots: [{ days: ['sunday'], start: '07:00', end: '08:15', room: 'Studio' }],
  },
  {
    slug: 'pop-pop-bang', name: 'Pop Pop Bang', tagline: 'Boxing', frequency: '3 days per week', price: 3000, duration: 75,
    intensity: 'high', coaches: ['malshan'], capacity: 6,
    description: ['Learn from the fundamentals to advanced-level fighting in the ring, with Malshan, who carries the ring name “The Wolverine”. You will be guided from basic footwork to ring IQ and groomed to a level where you can conquer the ring on your own.'],
    targetAreas: ['Footwork', 'Punch technique', 'Defence', 'Ring IQ', 'Conditioning'],
    equipment: ['Boxing gloves', 'Hand wraps', 'Heavy bags', 'Focus mitts', 'Boxing ring'],
    slots: [
      { days: ['monday', 'wednesday'], start: '18:30', end: '19:45', room: 'Boxing Ring' },
      { days: ['saturday'], start: '07:30', end: '08:45', room: 'Boxing Ring' },
    ],
  },
  {
    slug: 'titans-den', name: 'Titan\'s Den', tagline: 'MMA', frequency: '2 days per week', price: 3000, duration: 90,
    intensity: 'extreme', coaches: ['malshan'], capacity: 6,
    description: ['Learn from the fundamentals to advanced-level Mixed Martial Arts with Malshan, who carries the ring name “The Wolverine”. The programme is structured to deliver striking, defence, clinching, takedowns, ground & pound and submissions — covering every aspect required to survive an MMA fight.'],
    targetAreas: ['Striking', 'Takedowns & clinch', 'Ground & pound', 'Submissions', 'Fight conditioning'],
    equipment: ['MMA gloves', 'Shin guards', 'Mouth guard', 'Grappling mats', 'Cage'],
    slots: [{ days: ['tuesday', 'thursday'], start: '18:30', end: '20:00', room: 'Fight Zone' }],
  },
  {
    slug: 'naughty-40', name: 'Naughty 40', tagline: 'Senior Fitness (Over 40 y)', frequency: '1 day per week', price: 3500, duration: 60,
    intensity: 'low', coaches: ['malshan', 'amanda'], capacity: 8,
    description: ['A special training programme for senior and elderly members, to improve movement patterns, increase muscle mass and reduce fat mass. Individualised guidance ensures a smooth flow of movement.'],
    targetAreas: ['Mobility', 'Muscle mass', 'Balance', 'Joint health', 'Fat loss'],
    equipment: ['Light dumbbells', 'Resistance bands', 'Mats', 'Stability balls'],
    slots: [{ days: ['sunday'], start: '09:00', end: '10:00', room: 'Main Floor' }],
  },
  {
    slug: 'open-gym', name: 'Open Gym', tagline: 'All-in access', frequency: 'Day time, Mon – Fri', price: 1800, duration: 480,
    intensity: 'medium', coaches: [], capacity: 8,
    description: ['Train on your own schedule with all-in access to the gym floor for the day. Bring your own programme — our team is on hand for safety and equipment questions.'],
    targetAreas: ['Self-directed training'],
    equipment: ['Free weights', 'Squat racks', 'Cardio equipment', 'Benches', 'Cable machines'],
    slots: [{ days: WEEK, start: '09:00', end: '17:00', room: 'Main Floor' }],
  },
  {
    slug: 'elite-champion', name: 'Elite Champion', tagline: 'Specialized Athlete Training', frequency: 'Day time, Mon – Fri', price: 4500, duration: 120,
    intensity: 'extreme', coaches: ['malshan'], capacity: 5,
    description: ['Structured strength & conditioning programmes to groom general athletes into elite-level champions.'],
    targetAreas: ['Athletic performance', 'Strength & power', 'Speed & agility', 'Conditioning', 'Injury resilience'],
    equipment: ['Barbells', 'Plyo boxes', 'Sleds', 'Agility ladders', 'Medicine balls'],
    slots: [{ days: WEEK, start: '10:00', end: '12:00', room: 'Weights Floor' }],
  },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  { name: 'Getting Started', slug: 'getting-started', sortOrder: 1 },
  { name: 'Booking & Payments', slug: 'booking-payments', sortOrder: 2 },
  { name: 'Classes & Training', slug: 'classes-training', sortOrder: 3 },
  { name: 'Facilities & Access', slug: 'facilities-access', sortOrder: 4 },
];
const FAQS: { q: string; a: string; cat: string; featured: boolean }[] = [
  { q: 'Do I need experience to join?', cat: 'getting-started', featured: true, a: 'No experience needed. Our classes welcome every level and the coaches will scale each session to you. Just pick the class that sounds right and book a slot.' },
  { q: 'How do I book a class?', cat: 'getting-started', featured: true, a: 'Create a free account, choose a session from the Schedule (or a class page), pick the date and pay online. You will get a confirmation email straight away and a reminder the evening before.' },
  { q: 'What should I bring to my first class?', cat: 'getting-started', featured: true, a: 'Comfortable training clothes, trainers, a water bottle and a towel. Each class page lists the equipment used — most of it is provided.' },
  { q: 'Is The Wolverine Hub suitable for women?', cat: 'getting-started', featured: false, a: 'Absolutely. Our classes are mixed and our coaches create an environment that is challenging and respectful for everyone.' },
  { q: 'How much does a class cost?', cat: 'booking-payments', featured: false, a: 'You pay per session. Most classes are LKR 3,000, Senior Fitness is LKR 3,500, Open Gym day access is LKR 1,800, Elite Champion is LKR 4,500 — and the Saturday Easy Run is free. Exact prices are on each class page.' },
  { q: 'Are there monthly memberships?', cat: 'booking-payments', featured: false, a: 'No. There are no memberships, packages or lock-ins. You only pay for the sessions you book.' },
  { q: 'How do I pay?', cat: 'booking-payments', featured: false, a: 'Payments are made online at checkout when you book. Your seat is held for a few minutes while you pay and confirmed as soon as the payment goes through.' },
  { q: 'Can I cancel a booking?', cat: 'booking-payments', featured: false, a: 'Yes — you can cancel from your account up to 12 hours before the session starts. If you paid, our team will arrange your refund.' },
  { q: 'Will I get a confirmation and a reminder?', cat: 'booking-payments', featured: false, a: 'Yes. You receive a confirmation email as soon as your booking is confirmed, and a reminder email the evening before your session.' },
  { q: 'What if a session is full?', cat: 'booking-payments', featured: false, a: 'Class sizes are kept small on purpose. A full session shows “Full” — choose another date or another day.' },
  { q: 'Can I attend more than one class a week?', cat: 'classes-training', featured: false, a: 'Yes. Book as many sessions as you like — each one is booked and paid for separately.' },
  { q: 'Is sparring mandatory in Boxing or MMA?', cat: 'classes-training', featured: false, a: 'Never. Sparring is always optional and only when you are ready, with full protective gear.' },
  { q: 'Where are you located?', cat: 'facilities-access', featured: false, a: 'We train at 42 Duplication Road, Colombo 03. The Saturday Easy Run meets at a different location each week — the spot is announced before each run.' },
  { q: 'What are your opening hours?', cat: 'facilities-access', featured: false, a: 'Open Gym runs during the day, Monday to Friday. Classes run at the times shown on the Schedule, seven days a week.' },
];

// ── Home page / story ────────────────────────────────────────────────────────
const STORY = {
  __component: 'sections.our-story',
  eyebrow: 'Our Story',
  heading: 'Built in the ring. Raised by the pack.',
  intro: 'The Wolverine Hub was never meant to be another gym. It is a training ground built around real coaching, small groups and people who show up.',
  chapters: [
    { year: '2019', title: 'Two heavy bags and a barbell', text: 'It started small, loud and stubborn. Malshan — known in the ring as “The Wolverine” — opened the doors with a few bags, a rack and a simple promise: no shortcuts.' },
    { year: '2021', title: 'The hybrid era begins', text: 'Station-based hybrid training arrived, built for people chasing HYROX, ATHX, SPARTAN and DEKA FIT. Amanda joined the coaching team and the floor never went quiet again.' },
    { year: '2023', title: 'A pack, not a crowd', text: 'Free Saturday Easy Runs, small-group classes and coaches who know every name. Members stopped being customers and started being family.' },
    { year: '2025', title: 'One class at a time', text: 'No memberships. No lock-ins. Pick a class, book your slot and pay for the session you actually train. Simple, honest and built around you.' },
  ],
  quote: 'Strength isn’t what you lift. It’s what you refuse to put down.',
  quoteAuthor: 'Malshan — “The Wolverine”',
  cta: { label: 'Meet the Coaches', href: '/coaches', variant: 'ghost', openInNewTab: false },
  visible: true,
  anchorId: 'story',
};

const stripIds = (v: any): any => {
  if (Array.isArray(v)) return v.map(stripIds);
  if (v && typeof v === 'object') {
    const out: Record<string, any> = {};
    for (const [k, x] of Object.entries(v)) {
      if (k === 'id' || k === 'documentId' || k === 'createdAt' || k === 'updatedAt' || k === 'publishedAt') continue;
      out[k] = stripIds(x);
    }
    return out;
  }
  return v;
};

// ── Runner ───────────────────────────────────────────────────────────────────
export async function runCatalogV2(strapi: Core.Strapi, only?: string[]): Promise<boolean> {
  const docs = strapi.documents as Docs;
  const failures: string[] = [];
  const step = async (label: string, fn: () => Promise<void>) => {
    if (only && !only.includes(label)) return;
    try {
      await fn();
      strapi.log.info(`[catalog-v2] ✔ ${label}`);
    } catch (err: any) {
      failures.push(label);
      strapi.log.error(`[catalog-v2] ✖ ${label}: ${err?.message ?? err}`);
    }
  };

  const all = async (uid: string, extra: Record<string, unknown> = {}): Promise<any[]> =>
    (await docs(uid).findMany({ status: 'published', limit: 1000, ...extra })) as any[];

  const coachIds: Record<string, string> = {};
  const classIds: Record<string, string> = {};

  // 1) Coaches
  await step('coaches', async () => {
    const existing = await all('api::coach.coach');
    for (const c of COACHES) {
      const found = existing.find((e) => e.slug === c.slug);
      if (found) {
        coachIds[c.slug] = found.documentId;
        await docs('api::coach.coach').update({ documentId: found.documentId, status: 'published', data: c });
      } else {
        const created = await docs('api::coach.coach').create({ status: 'published', data: c });
        coachIds[c.slug] = created.documentId;
      }
    }
    for (const e of existing) {
      if (!COACHES.some((c) => c.slug === e.slug)) await docs('api::coach.coach').delete({ documentId: e.documentId });
    }
  });

  // 2) Classes (create/update new first, remove old after)
  await step('classes', async () => {
    const existing = await all('api::class.class');
    CLASSES.forEach(() => undefined);
    for (const [i, c] of CLASSES.entries()) {
      const data = {
        name: c.name,
        slug: c.slug,
        tagline: c.tagline,
        description: blocks(...c.description),
        frequency: c.frequency,
        price: c.price,
        isFree: c.price === 0,
        durationMinutes: c.duration,
        intensity: c.intensity,
        level: 'all',
        targetAreas: c.targetAreas.join('\n'),
        equipment: c.equipment.join('\n'),
        coaches: c.coaches.map((s) => coachIds[s]).filter(Boolean),
        sortOrder: i + 1,
      };
      const found = existing.find((e) => e.slug === c.slug);
      if (found) {
        classIds[c.slug] = found.documentId;
        await docs('api::class.class').update({ documentId: found.documentId, status: 'published', data });
      } else {
        const created = await docs('api::class.class').create({ status: 'published', data });
        classIds[c.slug] = created.documentId;
      }
    }
    // old placeholder classes go; their weekly slots go with them (next step recreates slots)
    for (const e of existing) {
      if (!CLASSES.some((c) => c.slug === e.slug)) await docs('api::class.class').delete({ documentId: e.documentId });
    }
  });

  // 3) Weekly schedule slots — rebuilt from the sheet
  await step('schedule slots', async () => {
    for (const old of await all('api::schedule-slot.schedule-slot')) {
      await docs('api::schedule-slot.schedule-slot').delete({ documentId: old.documentId });
    }
    for (const c of CLASSES) {
      for (const s of c.slots) {
        for (const day of s.days) {
          await docs('api::schedule-slot.schedule-slot').create({
            status: 'published',
            data: {
              class: classIds[c.slug],
              weekday: day,
              startTime: `${s.start}:00.000`,
              endTime: `${s.end}:00.000`,
              capacity: c.capacity,
              room: s.room,
              isActive: true,
            },
          });
        }
      }
    }
  });

  // 4) Programs + monthly pricing are gone
  await step('remove programs + packages', async () => {
    for (const uid of ['api::pricing-tier.pricing-tier', 'api::pass.pass']) {
      try {
        for (const d of await all(uid)) await docs(uid).delete({ documentId: d.documentId });
      } catch (err: any) {
        strapi.log.warn(`[catalog-v2] could not clear ${uid}: ${err?.message ?? err}`);
      }
    }
    const pages = await all('api::page.page');
    for (const p of pages.filter((x) => x.slug === 'programs')) await docs('api::page.page').delete({ documentId: p.documentId });
  });

  // 5) FAQ
  await step('faq', async () => {
    for (const f of await all('api::faq.faq')) await docs('api::faq.faq').delete({ documentId: f.documentId });
    for (const c of await all('api::faq-category.faq-category')) await docs('api::faq-category.faq-category').delete({ documentId: c.documentId });
    const catIds: Record<string, string> = {};
    for (const c of FAQ_CATEGORIES) {
      const created = await docs('api::faq-category.faq-category').create({ status: 'published', data: c });
      catIds[c.slug] = created.documentId;
    }
    for (const [i, f] of FAQS.entries()) {
      await docs('api::faq.faq').create({
        status: 'published',
        data: { question: f.q, answer: blocks(f.a), category: catIds[f.cat], isFeatured: f.featured, sortOrder: i + 1 },
      });
    }
  });

  // 6) Testimonials + blog mentions of the placeholder coaches
  await step('testimonials + blog', async () => {
    const fix = (s: string) =>
      s.replace(/Coach (Dilshan|Ashan|Nadun|Chamara)/g, 'Coach Malshan').replace(/Coach (Sachini|Tharaka|Kasuni)/g, 'Coach Amanda').replace(/one coach — (Ashan|Dilshan)/g, 'one coach — Malshan');
    const walk = (v: any): any => (typeof v === 'string' ? fix(v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v);
    for (const t of await all('api::testimonial.testimonial')) {
      if (fix(t.quote) !== t.quote) await docs('api::testimonial.testimonial').update({ documentId: t.documentId, status: 'published', data: { quote: fix(t.quote) } });
    }
    for (const p of await all('api::post.post')) {
      const summary = walk(p.summary);
      const content = walk(p.content);
      if (JSON.stringify([summary, content]) !== JSON.stringify([p.summary, p.content])) {
        await docs('api::post.post').update({ documentId: p.documentId, status: 'published', data: { summary, content } });
      }
    }
    for (const a of await all('api::author.author')) {
      if (/dilshan|ashan/i.test(a.slug)) {
        await docs('api::author.author').update({
          documentId: a.documentId, status: 'published',
          data: { name: 'Malshan Jayasekara', slug: 'malshan-jayasekara', bio: 'Head Coach & Founder at The Wolverine Hub. Fights under the ring name “The Wolverine”.' },
        });
      }
    }
  });

  // 7) Header + footer
  await step('header + footer', async () => {
    const header = await docs('api::header.header').findFirst({ status: 'published', populate: '*' });
    if (header) {
      await docs('api::header.header').update({
        documentId: header.documentId, status: 'published',
        data: {
          menuItems: [
            { label: 'Classes', href: '/classes', indexNumber: '01', description: '12 classes. Pay per session.' },
            { label: 'Schedule', href: '/schedule', indexNumber: '02', description: 'Book your next session.' },
            { label: 'Coaches', href: '/coaches', indexNumber: '03', description: 'Train with the best.' },
            { label: 'Our Story', href: '/#story', indexNumber: '04', description: 'Built in the ring.' },
            { label: 'Pricing', href: '/pricing', indexNumber: '05', description: 'Simple per-class rates.' },
            { label: 'Contact', href: '/contact', indexNumber: '06', description: 'Find us. Say hello.' },
          ],
          primaryCta: { label: 'Sign In / Sign Up', href: '/login', variant: 'primary', openInNewTab: false },
        },
      });
    }
    const footer = await docs('api::footer.footer').findFirst({ status: 'published', populate: '*' });
    if (footer) {
      const link = (label: string, href: string) => ({ label, href, openInNewTab: false });
      await docs('api::footer.footer').update({
        documentId: footer.documentId, status: 'published',
        data: {
          columns: [
            { heading: 'Train', links: [link('All Classes', '/classes'), link('Schedule', '/schedule'), link('Class Pricing', '/pricing'), link('Sign In / Sign Up', '/login')] },
            { heading: 'About', links: [link('Our Coaches', '/coaches'), link('Our Story', '/#story'), link('Gallery', '/gallery'), link('Contact', '/contact')] },
            { heading: 'Info', links: [link('Blog', '/blog'), link('FAQ', '/faq'), link('Privacy', '/privacy'), link('Terms', '/terms')] },
          ],
        },
      });
    }
  });

  // 8) Redirects for the removed pages
  await step('redirects', async () => {
    const existing = await all('api::redirect.redirect');
    const want = [
      { from: '/programs', to: '/classes', statusCode: 'permanent', isActive: true },
      { from: '/free-trial', to: '/register', statusCode: 'temporary', isActive: true },
    ];
    for (const r of want) {
      if (!existing.some((e) => e.from === r.from)) await docs('api::redirect.redirect').create({ status: 'published', data: r });
    }
  });

  // 9) Pricing page hero + Home page
  await step('pricing page copy', async () => {
    const page = (await docs('api::page.page').findMany({ status: 'published', filters: { slug: 'pricing' }, populate: { sections: { populate: '*' } } }))[0];
    if (!page) return;
    const sections = stripIds(page.sections).map((s: any) =>
      s.__component === 'sections.page-hero'
        ? { ...s, eyebrow: 'Pricing', heading: 'Pay Per Class.', subheading: 'No memberships. No lock-ins. Book the sessions you want and pay for each one.' }
        : s);
    await docs('api::page.page').update({ documentId: page.documentId, status: 'published', data: { sections } });
  });

  await step('home page', async () => {
    const page = (await docs('api::page.page').findMany({ status: 'published', filters: { slug: 'home' }, populate: { sections: { populate: '*' } } }))[0];
    if (!page) throw new Error('home page not found');
    let sections: any[] = stripIds(page.sections);
    const hadStory = sections.some((s) => s.__component === 'sections.our-story');
    sections = sections
      .filter((s) => s.__component !== 'sections.pricing-teaser')
      .flatMap((s) => (s.__component === 'sections.program-tiers' ? (hadStory ? [] : [STORY]) : [s]))
      .map((s) => {
        switch (s.__component) {
          case 'sections.hero-video':
            return {
              ...s,
              subheadline: 'Sri Lanka’s most demanding training ground. Classes, coaching and training built for those who mean it.',
              primaryCta: { label: 'Book a Class', href: '/schedule', variant: 'primary', openInNewTab: false },
              secondaryCta: { label: 'Explore Classes', href: '/classes', variant: 'ghost', openInNewTab: false },
            };
          case 'sections.stat-counters':
            return { ...s, stats: [{ label: 'Classes', number: '12' }, { label: 'Days a Week', number: '7' }, { label: 'Expert Coaches', number: '2' }, { label: 'Years Strong', number: '5' }] };
          case 'sections.marquee':
            return { ...s, items: ['Strength Training', 'Hybrid Training', 'Boxing', 'MMA', 'Aerobic Fitness', 'Lactate Threshold', 'Crossfit', 'Animal Flow', 'Vinyasa Flow Yoga', 'Easy Run', 'Senior Fitness', 'Athlete Training'] };
          case 'sections.class-rail':
            return { ...s, heading: 'Find Your Class.' };
          case 'sections.cta-banner':
            return {
              ...s,
              heading: 'Ready to Start?',
              subheading: 'Create your account, pick a class and book your first session in minutes.',
              primaryCta: { label: 'Sign Up', href: '/register', variant: 'primary', openInNewTab: false },
              secondaryCta: { label: 'View Schedule', href: '/schedule', variant: 'ghost', openInNewTab: false },
            };
          default:
            return s;
        }
      });
    if (!sections.some((s) => s.__component === 'sections.our-story')) {
      const at = sections.findIndex((s) => s.__component === 'sections.class-rail');
      sections.splice(at + 1, 0, STORY);
    }
    await docs('api::page.page').update({ documentId: page.documentId, status: 'published', data: { sections } });
  });

  strapi.log.info(`[catalog-v2] finished${failures.length ? ` with ${failures.length} failed step(s): ${failures.join(', ')}` : ' — all steps OK'}`);
  return failures.length === 0;
}

/**
 * Restores the per-class pay-per-class fields (price, frequency, targets, equipment, coach links).
 * Needed once after the shared DB was synced by a CMS running the older schema, which drops those
 * columns/link table. Idempotent and cheap — only touches classes that exist by slug.
 */
export async function restoreClassData(strapi: Core.Strapi): Promise<boolean> {
  const docs = strapi.documents as Docs;
  const coaches = (await docs('api::coach.coach').findMany({ status: 'published', limit: 100 })) as any[];
  const classes = (await docs('api::class.class').findMany({ status: 'published', limit: 1000 })) as any[];
  let ok = true;
  for (const [i, c] of CLASSES.entries()) {
    const found = classes.find((e) => e.slug === c.slug);
    if (!found) continue;
    try {
      await docs('api::class.class').update({
        documentId: found.documentId,
        status: 'published',
        data: {
          frequency: c.frequency,
          price: c.price,
          isFree: c.price === 0,
          targetAreas: c.targetAreas.join('\n'),
          equipment: c.equipment.join('\n'),
          coaches: c.coaches.map((s) => coaches.find((k) => k.slug === s)?.documentId).filter(Boolean),
          sortOrder: i + 1,
        },
      });
    } catch (err: any) {
      ok = false;
      strapi.log.error(`[catalog-v2] restore failed for ${c.slug}: ${err?.message ?? err}`);
    }
  }
  strapi.log.info(`[catalog-v2] class data restore ${ok ? 'OK' : 'had errors'}`);
  return ok;
}
