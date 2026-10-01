/**
 * set-strapi-field-labels.mjs
 * Writes human-readable labels + descriptions directly to the Strapi v5
 * content-manager configuration in the database (strapi_core_store_settings).
 *
 * Run ONCE after Strapi has started at least once (so the DB tables exist):
 *   node scripts/set-strapi-field-labels.mjs
 *
 * Safe to re-run — it merges our labels into any existing configuration.
 */

import pg   from '../cms/node_modules/pg/lib/index.js';
import path from 'node:path';
import fs   from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsEnv    = path.join(__dirname, '../cms/.env');

// ---------------------------------------------------------------------------
// Read DB connection from CMS .env
// ---------------------------------------------------------------------------
const envVars = Object.fromEntries(
  fs.readFileSync(cmsEnv, 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const DATABASE_URL = envVars.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL not found in cms/.env');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Field label + description map (keyed by field name)
// ---------------------------------------------------------------------------
const FIELD_META = {
  // identifiers
  title:           { label: 'Title',                    description: 'Display title shown on the page.' },
  name:            { label: 'Name',                     description: 'Full display name.' },
  slug:            { label: 'URL Slug',                 description: 'Auto-generated from the title. Sets the page URL path, e.g. /our-coaches.' },
  // text
  tagline:         { label: 'Tagline',                  description: 'Short punchy line shown beneath the title (one sentence max).' },
  shortBio:        { label: 'Short Bio',                description: 'Brief bio for card previews — 1 to 2 sentences.' },
  bio:             { label: 'Full Biography',           description: 'Full biography with rich text formatting.' },
  description:     { label: 'Description',              description: 'Detailed description — supports rich text, bullet lists, and links.' },
  content:         { label: 'Body Content',             description: 'Main content body — supports rich text, images, and embeds.' },
  body:            { label: 'Body Text',                description: 'Full body text with rich text formatting.' },
  summary:         { label: 'Short Summary',            description: 'Brief summary shown in listings (plain text, 1–2 sentences).' },
  caption:         { label: 'Caption',                  description: 'Short caption displayed below the image.' },
  alt:             { label: 'Alt Text',                 description: 'Describe the image for screen readers and SEO.' },
  notes:           { label: 'Internal Notes',           description: 'Private team notes — not shown on the public website.' },
  copyrightText:   { label: 'Copyright Line',           description: 'Use {year} as a placeholder, e.g. "© {year} The Wolverine Hub".' },
  wordmarkText:    { label: 'Footer Wordmark',          description: 'Large brand text shown as a background watermark in the footer.' },
  headline:        { label: 'Main Headline',            description: 'Large hero headline — keep it punchy, under 6 words.' },
  subheadline:     { label: 'Subheadline',              description: 'Supporting copy beneath the headline (1–2 sentences).' },
  // media
  image:           { label: 'Image',                    description: 'Upload an image. Preferred format: WebP or AVIF.' },
  video:           { label: 'Background Video',         description: 'Upload the hero video (WebM VP9 + MP4 H.264, muted, ≤ 3 MB).' },
  poster:          { label: 'Video Poster Image',       description: 'Still image shown before the video loads.' },
  thumbnail:       { label: 'Thumbnail',                description: 'Small preview image used in grids and listings.' },
  photo:           { label: 'Photo',                    description: 'Portrait or profile photo.' },
  coverImage:      { label: 'Cover Image',              description: 'Full-width feature image shown at the top of the page or post.' },
  previewImage:    { label: 'Hover Preview Image',      description: 'Image shown when hovering over this item in the navigation menu.' },
  previewVideo:    { label: 'Hover Preview Video',      description: 'Short looping video shown on hover.' },
  media:           { label: 'Media Asset',              description: 'Image or video file.' },
  logoLight:       { label: 'Logo – Light Version',     description: 'Full logo for dark backgrounds (transparent PNG or SVG).' },
  logoDark:        { label: 'Logo – Dark Version',      description: 'Full logo for light backgrounds (transparent PNG or SVG).' },
  logoMonogram:    { label: 'Logo – Monogram / Icon',   description: 'Small square icon used in the mobile header.' },
  favicon:         { label: 'Favicon',                  description: 'Browser tab icon. Recommended: 32 × 32 px PNG or ICO.' },
  icon:            { label: 'Icon',                     description: 'Small decorative icon image.' },
  ogImage:         { label: 'Social Share Image',       description: 'Image shown when shared on social media. Recommended: 1200 × 630 px.' },
  // CTA
  primaryCta:      { label: 'Primary Action Button',    description: 'Main call-to-action button. Leave empty to hide it.' },
  secondaryCta:    { label: 'Secondary Action Button',  description: 'Supporting ghost button. Leave empty to hide it.' },
  cta:             { label: 'Action Button',            description: 'Button configuration for this section.' },
  ctaBlock:        { label: 'Call-to-Action Block',     description: 'Optional CTA banner shown above the copyright bar in the footer.' },
  label:           { label: 'Button Text',              description: 'Text displayed on the button, e.g. "Start Training".' },
  href:            { label: 'Destination URL',          description: 'Where this button links. Use "/" for homepage, or a full https:// URL for external links.' },
  variant:         { label: 'Button Style',             description: 'primary = yellow filled  |  ghost = outline  |  secondary = muted  |  danger = red.' },
  openInNewTab:    { label: 'Open in New Tab?',         description: 'Tick this for external links so the visitor stays on the site.' },
  // navigation
  menuItems:       { label: 'Navigation Menu Items',    description: 'All links shown in the main menu. Drag to reorder.' },
  indexNumber:     { label: 'Menu Index Number',        description: 'Number shown beside the item in the menu, e.g. "01", "02".' },
  subItems:        { label: 'Sub-links',                description: 'Optional secondary links shown below this menu item.' },
  columns:         { label: 'Footer Link Columns',      description: 'Groups of links in the footer. Drag to reorder.' },
  heading:         { label: 'Column Heading',           description: 'Title shown above this group of footer links.' },
  links:           { label: 'Links',                    description: 'List of links in this column.' },
  legalLinks:      { label: 'Legal Footer Links',       description: 'Links in the bottom bar — Privacy Policy, Terms of Service, etc.' },
  url:             { label: 'Website URL',              description: 'Full URL including https://.' },
  // announcement bar
  announcementBarEnabled: { label: 'Show Announcement Bar?',   description: 'Display the banner strip above the main header.' },
  announcementBarText:    { label: 'Announcement Text',         description: 'Message shown in the announcement bar (keep to one line).' },
  announcementBarLink:    { label: 'Announcement Link URL',     description: 'Optional destination URL. Leave blank for no link.' },
  announcementBarColour:  { label: 'Announcement Bar Colour',   description: 'Background colour of the announcement bar.' },
  // newsletter
  newsletterEnabled:    { label: 'Show Newsletter Form?',       description: 'Display the email sign-up form in the footer.' },
  newsletterHeading:    { label: 'Newsletter Heading',           description: 'Heading above the newsletter form, e.g. "Stay in the Loop".' },
  newsletterSubheading: { label: 'Newsletter Subheading',        description: 'Short description below the newsletter heading.' },
  // SEO
  seo:             { label: 'SEO Settings',               description: 'Search engine optimisation settings for this page.' },
  defaultSeo:      { label: 'Default SEO Settings',       description: 'Fallback SEO used when a page has no specific SEO set.' },
  metaTitle:       { label: 'Page Title (SEO)',            description: 'Shown in browser tabs and Google results. Keep under 60 characters.' },
  metaDescription: { label: 'Meta Description',           description: 'Shown in Google results. Keep under 160 characters.' },
  keywords:        { label: 'Keywords',                   description: 'Comma-separated SEO keywords (optional).' },
  canonicalURL:    { label: 'Canonical URL',              description: 'Preferred URL for this page. Leave blank to use the default.' },
  metaRobots:      { label: 'Robots Directive',           description: 'Controls crawler access, e.g. "noindex, nofollow". Leave blank for normal indexing.' },
  ogTitle:         { label: 'Social Share Title',         description: 'Title when sharing on social media. Defaults to Page Title if empty.' },
  ogDescription:   { label: 'Social Share Description',   description: 'Description when sharing. Defaults to Meta Description if empty.' },
  twitterCard:     { label: 'Twitter / X Card Type',      description: '"Summary" = small image  |  "Summary Large Image" = large banner.' },
  structuredData:  { label: 'Structured Data (JSON-LD)',   description: 'Advanced: paste a JSON-LD object for rich Google search results.' },
  // global settings
  siteName:          { label: 'Site Name',              description: 'Official site name used in browser tabs and SEO.' },
  siteTagline:       { label: 'Brand Tagline',          description: 'Short tagline shown under the logo in certain layouts.' },
  email:             { label: 'Contact Email',          description: 'Main contact email address displayed on the site.' },
  phone:             { label: 'Phone Number',           description: 'Contact number including country code, e.g. +94 77 123 4567.' },
  whatsapp:          { label: 'WhatsApp Number',        description: 'Number including country code with no spaces, e.g. +94771234567.' },
  address:           { label: 'Physical Address',       description: 'Full postal address shown on the Contact page.' },
  mapLink:           { label: 'Google Maps URL',        description: 'Link to the location on Google Maps.' },
  hoursJson:         { label: 'Opening Hours (JSON)',   description: 'JSON object, e.g. {"Monday": "6am–9pm", "Tuesday": "6am–9pm"}.' },
  instagram:         { label: 'Instagram Username',     description: 'Handle without the @ symbol.' },
  facebook:          { label: 'Facebook Page URL',      description: 'Full Facebook page URL.' },
  youtube:           { label: 'YouTube Channel URL',    description: 'Full YouTube channel URL.' },
  tiktok:            { label: 'TikTok Username',        description: 'Handle without the @ symbol.' },
  twitterHandle:     { label: 'Twitter / X Handle',    description: 'Username without the @ symbol.' },
  companyNumber:     { label: 'Company Registration Number', description: 'Used in legal footer notices.' },
  // experience toggles
  experienceIntroAnimation:  { label: 'Enable Intro Animation',  description: 'Show the full-screen cinematic intro sequence on first visit.' },
  experienceWebgl:           { label: 'Enable WebGL Effects',    description: 'Enable 3D / shader effects in the hero section.' },
  experienceSmoothScroll:    { label: 'Enable Smooth Scroll',    description: 'Enable GSAP ScrollSmoother on desktop browsers.' },
  experienceCustomCursor:    { label: 'Enable Custom Cursor',    description: 'Show a custom cursor on desktop (auto-disabled on touch devices).' },
  experienceSoundDefault:    { label: 'Sound On by Default',     description: 'Play ambient sound automatically — leave off.' },
  experienceMotionIntensity: { label: 'Motion Intensity',        description: 'Full = all animations  |  Lite = subtle only  |  Minimal = static.' },
  // classes
  durationMinutes: { label: 'Duration (minutes)',       description: 'Class length in minutes, e.g. 60 for one hour.' },
  intensity:       { label: 'Intensity Level',          description: 'How physically demanding: Low, Medium, High, or Extreme.' },
  level:           { label: 'Experience Level',         description: 'Who this suits: Beginner, Intermediate, Advanced, or All Levels.' },
  discipline:      { label: 'Discipline',               description: 'The martial art or training style this class belongs to.' },
  disciplines:     { label: 'Disciplines Taught',       description: 'Martial arts or training styles this coach teaches.' },
  isFree:          { label: 'Free Class?',              description: 'Tick if this class is free and does not require membership.' },
  // coaches
  role:            { label: 'Role / Title',             description: 'Job title on the coach card, e.g. "Head Boxing Coach".' },
  yearsExperience: { label: 'Years of Experience',      description: 'Total years of coaching or competition experience.' },
  specialties:     { label: 'Specialties',              description: 'Key skills or techniques — enter one per line.' },
  isHeadCoach:     { label: 'Head Coach?',              description: 'Mark as Head Coach to feature this person prominently.' },
  // schedule
  weekday:         { label: 'Day of Week',              description: 'Which day this slot runs every week.' },
  startTime:       { label: 'Start Time',               description: 'Time the class begins in 24-hour format, e.g. 06:00.' },
  endTime:         { label: 'End Time',                 description: 'Time the class ends in 24-hour format, e.g. 07:00.' },
  capacity:        { label: 'Maximum Capacity',         description: 'Maximum number of participants per session.' },
  room:            { label: 'Room / Area',              description: 'Which part of the gym, e.g. "Main Floor" or "Boxing Ring".' },
  isActive:        { label: 'Active on Schedule?',      description: 'Only active slots are shown on the public schedule.' },
  // pricing
  tier:            { label: 'Pricing Tier',             description: 'The membership tier this pass belongs to.' },
  duration:        { label: 'Duration Label',           description: 'Human-readable duration, e.g. "1 Month" or "3 Months".' },
  durationDays:    { label: 'Duration in Days',         description: 'Exact number of days — used to calculate pass expiry.' },
  priceLKR:        { label: 'Price (LKR)',              description: 'Price in Sri Lankan Rupees. No commas or currency symbols.' },
  payHereItemName: { label: 'PayHere Item Name',        description: 'Short item name for the PayHere gateway. No special characters.' },
  isPurchasable:   { label: 'Available for Purchase?',  description: 'If unticked, this pass is hidden from the pricing page.' },
  isMostPopular:   { label: 'Most Popular?',            description: 'Adds a "Most Popular" badge to highlight this tier.' },
  colour:          { label: 'Accent Colour',            description: 'Colour used to style this card: Yellow, Blue, Red, or White.' },
  features:        { label: 'Features List',            description: 'Bullet points shown on the pricing card — one per entry.' },
  sessions:        { label: 'Number of Sessions',       description: 'How many sessions are included in this pack.' },
  validityDays:    { label: 'Valid For (days)',          description: 'How many days this pack remains valid after purchase.' },
  tokens:          { label: 'Class Tokens',             description: 'Number of class tokens included in this pack.' },
  // testimonials
  quote:           { label: 'Testimonial Quote',        description: "The member's words. Quote marks are added automatically by the design." },
  authorName:      { label: "Member's Name",            description: 'Full name of the person giving the testimonial.' },
  authorTitle:     { label: 'Member Description',       description: 'Short context, e.g. "Boxing member since 2022" or "Lost 12 kg in 4 months".' },
  rating:          { label: 'Star Rating',              description: 'Rating out of 5.' },
  goal:            { label: 'Training Goal',            description: "Member's primary training goal, e.g. Weight Loss, Competition Prep." },
  isFeatured:      { label: 'Featured?',               description: 'Featured items appear in homepage sections and spotlights.' },
  // FAQs
  question:        { label: 'Question',                 description: 'The FAQ — write it as the visitor would phrase it.' },
  answer:          { label: 'Answer',                   description: 'Full answer with rich text. You can use bullet lists, bold text, and links.' },
  category:        { label: 'Category',                 description: 'Groups this question with related FAQs on the FAQ page.' },
  // posts
  author:          { label: 'Author',                   description: 'The person who wrote this post.' },
  tags:            { label: 'Tags',                     description: 'Keywords for filtering and discovery — enter one tag per entry.' },
  readingTimeMinutes: { label: 'Reading Time (minutes)', description: 'Estimated reading time. Leave blank to auto-calculate.' },
  // gallery
  galleryCategory: { label: 'Gallery Category',         description: 'Organises photos into groups, e.g. "Boxing", "Events".' },
  // redirects
  from:            { label: 'Old URL (redirect from)',  description: 'The old URL path, e.g. /old-page.' },
  to:              { label: 'New URL (redirect to)',    description: 'The destination URL, e.g. /new-page or https://external.com.' },
  statusCode:      { label: 'Redirect Type',           description: 'Permanent (301) = moved forever  |  Temporary (302) = short-term.' },
  // UI strings
  skipLinkLabel:        { label: '"Skip to Content" Link Text',    description: 'Accessibility link used by screen readers.' },
  searchPlaceholder:    { label: 'Search Box Placeholder Text',    description: 'Placeholder shown inside the search input.' },
  filterNoResults:      { label: '"No Results" Message',           description: 'Shown when a filter or search returns nothing.' },
  loadMoreLabel:        { label: '"Load More" Button Text',        description: 'Text on the load-more button.' },
  bookNowLabel:         { label: '"Book Now" Button Text',         description: 'Text on booking buttons throughout the site.' },
  viewDetailsLabel:     { label: '"View Details" Link Text',       description: 'Text on card detail link buttons.' },
  fullBadge:            { label: '"Class Full" Badge Text',        description: 'Badge shown on fully booked schedule slots.' },
  spotsLeftTemplate:    { label: '"Spots Left" Template',          description: 'Use {n} as a placeholder, e.g. "{n} spots left".' },
  introSkipLabel:       { label: '"Skip Intro" Button Text',       description: 'Text on the intro animation skip button.' },
  cookieNotice:         { label: 'Cookie Notice Text',             description: 'Text shown in the cookie consent banner.' },
  formSuccessDefault:   { label: 'Default Form Success Message',   description: 'Shown after any form is submitted successfully.' },
  formErrorDefault:     { label: 'Default Form Error Message',     description: 'Shown when a form submission fails.' },
  notFoundHeading:      { label: '404 Page Heading',               description: 'Heading on the "Page Not Found" page.' },
  notFoundBody:         { label: '404 Page Body Text',             description: 'Body text on the 404 page.' },
  errorHeading:         { label: 'Error Page Heading',             description: 'Heading on the generic error page.' },
  errorBody:            { label: 'Error Page Body Text',           description: 'Body text on the error page.' },
  // page builder
  sections:        { label: 'Page Sections',            description: 'Build the page by adding and reordering sections. Each section creates a different visual block.' },
  visible:         { label: 'Visible on Page?',         description: 'Untick to hide this section without deleting it.' },
  anchorId:        { label: 'Section Anchor ID',        description: 'Optional anchor for deep-linking, e.g. "about". Used in /page#about URLs.' },
  // sort
  sortOrder:       { label: 'Sort Order',               description: 'Lower numbers appear first in listings.' },
  // stat
  value:           { label: 'Stat Value',               description: 'The number or text shown in large format, e.g. "24" or "500+".' },
  prefix:          { label: 'Prefix',                   description: 'Text shown before the number, e.g. "Over" or "~".' },
  suffix:          { label: 'Suffix',                   description: 'Text shown after the number, e.g. "+" or "classes".' },
  // form / lead
  formKey:         { label: 'Form Key',                 description: 'Internal identifier for this form, e.g. "contact" or "free-trial".' },
  successMessage:  { label: 'Success Message',          description: 'Message shown after a successful form submission.' },
  errorMessage:    { label: 'Form Error Message',       description: 'Message shown when a form submission fails.' },
  consentText:     { label: 'Consent / GDPR Text',     description: 'Checkbox label for data consent, e.g. "I agree to the privacy policy."' },
  recipientEmails: { label: 'Recipient Emails (JSON)',  description: 'JSON array of email addresses to notify, e.g. ["[email protected]"].' },
  message:         { label: 'Message',                  description: 'The message or enquiry the visitor submitted.' },
  ipHash:          { label: 'IP Hash (rate limiting)',  description: 'Hashed visitor IP used for spam rate limiting. Do not edit.' },
  status:          { label: 'Lead Status',              description: 'Where this enquiry is in your follow-up workflow.' },
  fields:          { label: 'Extra Fields (JSON)',      description: 'Additional form field data stored as JSON.' },
};

// ---------------------------------------------------------------------------
// All API content type UIDs to configure
// ---------------------------------------------------------------------------
const API_UIDS = [
  'api::global.global',
  'api::header.header',
  'api::footer.footer',
  'api::ui-strings.ui-strings',
  'api::page.page',
  'api::legal-page.legal-page',
  'api::class.class',
  'api::discipline.discipline',
  'api::schedule-slot.schedule-slot',
  'api::coach.coach',
  'api::program.program',
  'api::pricing-tier.pricing-tier',
  'api::pass.pass',
  'api::add-on.add-on',
  'api::token-pack.token-pack',
  'api::testimonial.testimonial',
  'api::faq.faq',
  'api::faq-category.faq-category',
  'api::gallery-item.gallery-item',
  'api::post.post',
  'api::post-category.post-category',
  'api::author.author',
  'api::amenity.amenity',
  'api::partner.partner',
  'api::redirect.redirect',
  'api::stat.stat',
  'api::form.form',
  'api::lead.lead',
  'api::newsletter-subscriber.newsletter-subscriber',
];

// Schema files to read attributes from
const CMS_SRC = path.join(__dirname, '../cms/src/api');

function loadAttributes(uid) {
  // uid like "api::footer.footer"
  const apiName = uid.replace('api::', '').split('.')[0];
  const schemaPath = path.join(CMS_SRC, apiName, 'content-types', apiName, 'schema.json');
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    return schema.attributes ?? {};
  } catch {
    return null; // schema file not found
  }
}

// ---------------------------------------------------------------------------
// Build a metadatas object for a UID, merging existing with our labels
// ---------------------------------------------------------------------------
function buildMetadatas(existing, rawAttributes) {
  const metadatas = JSON.parse(JSON.stringify(existing?.metadatas ?? {}));
  let dirty = false;

  for (const [fieldName, attr] of Object.entries(rawAttributes)) {
    const meta = FIELD_META[fieldName];
    if (!meta) continue;

    const current = metadatas[fieldName] ?? { edit: {}, list: {} };
    if (current.edit?.label === meta.label) continue; // already correct

    metadatas[fieldName] = {
      edit: {
        ...(current.edit ?? {}),
        label:       meta.label,
        description: meta.description ?? '',
        placeholder: current.edit?.placeholder ?? '',
        visible:     current.edit?.visible     ?? true,
        editable:    current.edit?.editable    ?? true,
      },
      list: {
        ...(current.list ?? {}),
        label:      meta.label,
        searchable: current.list?.searchable ?? ['string', 'email', 'uid', 'enumeration'].includes(attr.type),
        sortable:   current.list?.sortable   ?? ['string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'uid'].includes(attr.type),
      },
    };
    dirty = true;
  }

  return { metadatas, dirty };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('Connected to database.');

  let updated = 0;
  let skipped = 0;

  for (const uid of API_UIDS) {
    const rawAttributes = loadAttributes(uid);
    if (!rawAttributes) {
      console.log(`  SKIP (no schema): ${uid}`);
      skipped++;
      continue;
    }

    // DB key Strapi v5 uses: "plugin_content-manager_configuration_content-types::api::footer.footer"
    const dbKey = `plugin_content-manager_configuration_content-types::${uid}`;

    // Read existing value
    const result = await client.query(
      'SELECT value FROM strapi_core_store_settings WHERE key = $1 LIMIT 1',
      [dbKey]
    );

    const existingRaw = result.rows[0]?.value;
    const existing    = existingRaw ? (typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw) : null;

    const { metadatas, dirty } = buildMetadatas(existing, rawAttributes);

    if (!dirty) {
      console.log(`  OK (up to date): ${uid}`);
      skipped++;
      continue;
    }

    const newValue = {
      uid,
      settings: existing?.settings ?? {
        bulkable: true, filterable: true, searchable: true,
        pageSize: 10,
        mainField: 'title' in rawAttributes ? 'title' : ('name' in rawAttributes ? 'name' : 'id'),
        defaultSortBy: 'id', defaultSortOrder: 'ASC',
      },
      metadatas,
      layouts: existing?.layouts ?? { list: ['id', 'createdAt', 'updatedAt'], edit: [] },
    };

    if (existing) {
      await client.query(
        'UPDATE strapi_core_store_settings SET value = $1 WHERE key = $2',
        [JSON.stringify(newValue), dbKey]
      );
    } else {
      await client.query(
        `INSERT INTO strapi_core_store_settings (key, value, type, environment, tag)
         VALUES ($1, $2, 'plugin', '', NULL)`,
        [dbKey, JSON.stringify(newValue)]
      );
    }

    console.log(`  UPDATED: ${uid}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
  console.log('Restart Strapi to see the changes in the admin panel.\n');

} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
