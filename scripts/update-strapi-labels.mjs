/**
 * update-strapi-labels.mjs
 * Adds human-readable labels + descriptions to every Strapi field via
 * pluginOptions["content-manager"], and upgrades long string fields to
 * Strapi v5 Blocks (rich text) where appropriate.
 *
 * Run from website/ root:
 *   node scripts/update-strapi-labels.mjs
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsRoot   = path.join(__dirname, '../cms/src');

// ---------------------------------------------------------------------------
// Label + description map keyed by field name
// ---------------------------------------------------------------------------
const FIELD_META = {
  // ── identifiers ──────────────────────────────────────────────────────────
  title:          { label: 'Title',               description: 'The display title shown on the page and in browser tabs.' },
  name:           { label: 'Name',                description: 'Full display name.' },
  slug:           { label: 'URL Slug',            description: 'URL path segment, auto-generated from the title. E.g. "our-classes" → /our-classes.' },
  displayName:    { label: 'Display Name',        description: 'Label shown in the admin panel for this item.' },

  // ── text / copy ──────────────────────────────────────────────────────────
  tagline:        { label: 'Tagline',             description: 'Short punchy line shown beneath the title (one sentence max).' },
  shortBio:       { label: 'Short Bio',           description: 'Brief bio for card previews — 1 to 2 sentences.' },
  bio:            { label: 'Full Biography',      description: 'Full biography with rich text formatting.' },
  description:    { label: 'Description',         description: 'Detailed description with rich text formatting.' },
  content:        { label: 'Body Content',        description: 'Main body of this entry — supports rich text, images, and embeds.' },
  body:           { label: 'Body Text',           description: 'Full body text with rich text formatting.' },
  summary:        { label: 'Summary',             description: 'Short summary shown in listings and search results (1–2 sentences, plain text).' },
  caption:        { label: 'Caption',             description: 'Short caption displayed below the image.' },
  alt:            { label: 'Alt Text',            description: 'Describe the image for screen readers and search engines.' },
  notes:          { label: 'Internal Notes',      description: 'Private notes for the team — not shown on the public website.' },
  copyrightText:  { label: 'Copyright Line',      description: 'Copyright notice in the bottom bar. Use {year} as a placeholder for the current year, e.g. "© {year} The Wolverine Hub".' },
  wordmarkText:   { label: 'Footer Wordmark',     description: 'Large brand text shown as a background watermark in the footer.' },

  // ── headline / hero ───────────────────────────────────────────────────────
  headline:       { label: 'Main Headline',       description: 'Large hero headline — keep it punchy, under 6 words.' },
  subheadline:    { label: 'Subheadline',         description: 'Supporting copy beneath the headline (1–2 sentences).' },

  // ── media ─────────────────────────────────────────────────────────────────
  image:          { label: 'Image',               description: 'Upload an image. Preferred format: WebP or AVIF.' },
  video:          { label: 'Background Video',    description: 'Upload the hero video (WebM VP9 + MP4 H.264, muted, ≤ 3 MB).' },
  poster:         { label: 'Video Poster Image',  description: 'Still image shown before the video loads. Must match the video dimensions.' },
  thumbnail:      { label: 'Thumbnail',           description: 'Small preview image used in grids, cards, and listings.' },
  photo:          { label: 'Photo',               description: 'Portrait or profile photo.' },
  coverImage:     { label: 'Cover Image',         description: 'Full-width feature image shown at the top of the page or post.' },
  previewImage:   { label: 'Hover Preview Image', description: 'Image shown when hovering over this item in the navigation menu.' },
  previewVideo:   { label: 'Hover Preview Video', description: 'Short looping video shown when hovering over this item.' },
  media:          { label: 'Media Asset',         description: 'Image or video file.' },
  logoLight:      { label: 'Logo – Light Version',  description: 'Full logo for use on dark backgrounds (transparent PNG or SVG).' },
  logoDark:       { label: 'Logo – Dark Version',   description: 'Full logo for use on light backgrounds (transparent PNG or SVG).' },
  logoMonogram:   { label: 'Logo – Monogram / Icon',description: 'Small square icon version of the logo used in the mobile header and favicons.' },
  favicon:        { label: 'Favicon',             description: 'Browser tab icon. Recommended: 32 × 32 px ICO or PNG.' },
  icon:           { label: 'Icon',                description: 'Small decorative icon image.' },
  ogImage:        { label: 'Social Share Image',  description: 'Image shown when sharing on social media. Recommended: 1200 × 630 px.' },

  // ── CTA buttons ───────────────────────────────────────────────────────────
  primaryCta:     { label: 'Primary Action Button',   description: 'Main call-to-action button. Leave empty to hide it.' },
  secondaryCta:   { label: 'Secondary Action Button', description: 'Supporting action link or ghost button. Leave empty to hide it.' },
  cta:            { label: 'Call-to-Action Button',   description: 'Action button configuration for this section.' },
  ctaButton:      { label: 'Action Button',           description: 'Button that appears at the end of this section.' },
  // shared/cta-button component fields
  label:          { label: 'Button Text',         description: 'Text displayed on the button (e.g. "Start Training").' },
  href:           { label: 'Destination URL',     description: 'Where the button links. Use "/" for homepage or a full URL for external links.' },
  variant:        { label: 'Button Style',        description: 'Visual style: primary = yellow filled, ghost = outline, secondary = muted, danger = red.' },
  openInNewTab:   { label: 'Open in New Tab?',    description: 'Tick this for external links so the visitor stays on the site.' },

  // ── shared/link component fields ──────────────────────────────────────────
  // (label and href already mapped above)

  // ── navigation ────────────────────────────────────────────────────────────
  menuItems:      { label: 'Navigation Menu Items', description: 'All links shown in the main navigation. Drag to reorder.' },
  indexNumber:    { label: 'Index Number',         description: 'Number displayed next to the item in the menu (e.g. "01", "02").' },
  subItems:       { label: 'Sub-links',            description: 'Optional secondary links shown below this menu item.' },
  columns:        { label: 'Footer Link Columns',  description: 'Groups of links in the footer. Drag to reorder.' },
  heading:        { label: 'Column Heading',       description: 'Title above this group of footer links.' },
  links:          { label: 'Links',               description: 'List of links in this column.' },
  legalLinks:     { label: 'Legal Links',          description: 'Links shown in the footer bottom bar — Privacy Policy, Terms, etc.' },

  // ── announcement bar ──────────────────────────────────────────────────────
  announcementBarEnabled: { label: 'Show Announcement Bar?',  description: 'Display the strip banner above the header.' },
  announcementBarText:    { label: 'Announcement Text',       description: 'Message shown in the announcement bar (keep short — one line).' },
  announcementBarLink:    { label: 'Announcement Link URL',   description: 'Optional destination URL. Leave blank for no link.' },
  announcementBarColour:  { label: 'Announcement Bar Colour', description: 'Background colour of the announcement bar.' },

  // ── newsletter ────────────────────────────────────────────────────────────
  newsletterEnabled:    { label: 'Show Newsletter Sign-up?', description: 'Display the email sign-up form in the footer.' },
  newsletterHeading:    { label: 'Newsletter Heading',       description: 'Heading above the newsletter form (e.g. "Stay in the Loop").' },
  newsletterSubheading: { label: 'Newsletter Subheading',    description: 'Short description below the newsletter heading.' },

  // ── SEO ───────────────────────────────────────────────────────────────────
  seo:              { label: 'SEO Settings',              description: 'Search engine optimisation settings for this page.' },
  defaultSeo:       { label: 'Default SEO Settings',      description: 'Fallback SEO used when a page has no specific SEO fields set.' },
  metaTitle:        { label: 'Page Title (SEO)',           description: 'Title shown in browser tabs and Google results. Keep under 60 characters.' },
  metaDescription:  { label: 'Meta Description',          description: 'Short description shown in Google results. Keep under 160 characters.' },
  keywords:         { label: 'Keywords',                  description: 'Comma-separated SEO keywords (optional — not used by most search engines).' },
  canonicalURL:     { label: 'Canonical URL',             description: 'Preferred URL if this content exists at multiple paths. Leave blank for default.' },
  metaRobots:       { label: 'Robots Directive',          description: 'Controls crawler access, e.g. "noindex, nofollow". Leave blank for normal indexing.' },
  ogTitle:          { label: 'Social Share Title',        description: 'Title when sharing on social media. Defaults to Page Title if empty.' },
  ogDescription:    { label: 'Social Share Description',  description: 'Description when sharing. Defaults to Meta Description if empty.' },
  twitterCard:      { label: 'Twitter / X Card Type',     description: '"Summary" = small image, "Summary Large Image" = big banner.' },
  structuredData:   { label: 'Structured Data (JSON-LD)', description: 'Advanced: paste a JSON-LD object for rich search result snippets.' },

  // ── global / site settings ────────────────────────────────────────────────
  siteName:         { label: 'Site Name',           description: 'Official site name shown in browser tabs and SEO (e.g. "The Wolverine Hub").' },
  siteTagline:      { label: 'Brand Tagline',        description: 'Short tagline shown under the logo in some layouts.' },
  email:            { label: 'Contact Email',        description: 'Main contact email address displayed on the site.' },
  phone:            { label: 'Phone Number',         description: 'Contact phone number including country code, e.g. +94 77 123 4567.' },
  whatsapp:         { label: 'WhatsApp Number',      description: 'WhatsApp number including country code with no spaces, e.g. +94771234567.' },
  address:          { label: 'Physical Address',     description: 'Full postal address shown on the Contact page.' },
  mapLink:          { label: 'Google Maps URL',      description: 'Link to the location on Google Maps.' },
  hoursJson:        { label: 'Opening Hours (JSON)', description: 'Opening hours as a JSON object, e.g. {"Monday": "6am–9pm", "Tuesday": "6am–9pm"}.' },
  instagram:        { label: 'Instagram Username',   description: 'Instagram handle without the @ symbol.' },
  facebook:         { label: 'Facebook Page URL',    description: 'Full Facebook page URL.' },
  youtube:          { label: 'YouTube Channel URL',  description: 'Full YouTube channel URL.' },
  tiktok:           { label: 'TikTok Username',      description: 'TikTok handle without the @ symbol.' },
  twitterHandle:    { label: 'Twitter / X Handle',   description: 'Twitter/X username without the @ symbol.' },
  companyNumber:    { label: 'Company Registration Number', description: 'Used in legal footer notices.' },

  // ── experience toggles ────────────────────────────────────────────────────
  experienceIntroAnimation: { label: 'Enable Intro Animation',  description: 'Show the full-screen cinematic intro on first visit.' },
  experienceWebgl:          { label: 'Enable WebGL Effects',    description: 'Enable 3D / shader effects in the hero section. Disabling improves performance on low-end devices.' },
  experienceSmoothScroll:   { label: 'Enable Smooth Scroll',    description: 'Enable GSAP ScrollSmoother on desktop browsers.' },
  experienceCustomCursor:   { label: 'Enable Custom Cursor',    description: 'Show a custom cursor on desktop (auto-disabled on touch devices).' },
  experienceSoundDefault:   { label: 'Sound On by Default',     description: 'Play ambient sound automatically on load. Not recommended — leave off unless specifically needed.' },
  experienceMotionIntensity:{ label: 'Motion Intensity',        description: 'Full = all animations active. Lite = reduced animations. Minimal = static layout only.' },

  // ── classes ───────────────────────────────────────────────────────────────
  durationMinutes:  { label: 'Duration (minutes)',  description: 'Class length in minutes, e.g. 60 for a one-hour class.' },
  intensity:        { label: 'Intensity Level',     description: 'How physically demanding this class is: Low, Medium, High, or Extreme.' },
  level:            { label: 'Experience Level',    description: 'Who this class suits: Beginner, Intermediate, Advanced, or All levels.' },
  discipline:       { label: 'Discipline',          description: 'The martial art or training style this class belongs to.' },
  disciplines:      { label: 'Disciplines',         description: 'Martial arts or training styles taught by this coach.' },
  isFree:           { label: 'Free Class?',          description: 'Tick if this class is free and does not require a membership or pass.' },

  // ── coaches ───────────────────────────────────────────────────────────────
  role:             { label: 'Role / Title',         description: 'Job title shown on the coach card, e.g. "Head Boxing Coach".' },
  yearsExperience:  { label: 'Years of Experience',  description: 'Total years of coaching or competition experience.' },
  specialties:      { label: 'Specialties',          description: 'Key skills or techniques — enter one per line.' },
  isHeadCoach:      { label: 'Head Coach?',           description: 'Mark as Head Coach to feature this person prominently on the Coaches page.' },

  // ── schedule ──────────────────────────────────────────────────────────────
  class:            { label: 'Class',               description: 'Which class is scheduled in this time slot.' },
  coach:            { label: 'Coach',               description: 'Coach leading this session (optional).' },
  weekday:          { label: 'Day of Week',          description: 'Which day this slot runs every week.' },
  startTime:        { label: 'Start Time',           description: 'Time the class begins in 24-hour format, e.g. 06:00.' },
  endTime:          { label: 'End Time',             description: 'Time the class ends in 24-hour format, e.g. 07:00.' },
  capacity:         { label: 'Maximum Capacity',     description: 'Maximum number of participants allowed per session.' },
  room:             { label: 'Room / Area',          description: 'Which part of the gym this runs in, e.g. "Main Floor" or "Boxing Ring".' },
  isActive:         { label: 'Active on Schedule?',  description: 'Only active slots are shown on the public schedule page.' },

  // ── pricing ───────────────────────────────────────────────────────────────
  tier:             { label: 'Pricing Tier',         description: 'The membership tier this pass belongs to.' },
  duration:         { label: 'Duration Label',       description: 'Human-readable duration shown to customers, e.g. "1 Month" or "3 Months".' },
  durationDays:     { label: 'Duration in Days',     description: 'Exact number of days — used to calculate pass expiry.' },
  priceLKR:         { label: 'Price (LKR)',           description: 'Price in Sri Lankan Rupees. Do not include commas or currency symbols.' },
  payHereItemName:  { label: 'PayHere Item Name',    description: 'Short item name sent to the PayHere payment gateway. No special characters.' },
  isPurchasable:    { label: 'Available for Purchase?', description: 'If unticked, this pass is hidden from the pricing page.' },
  isMostPopular:    { label: 'Most Popular?',         description: 'Adds a "Most Popular" badge to highlight this tier.' },
  colour:           { label: 'Accent Colour',        description: 'Colour used to style this card: Yellow, Blue, Red, or White.' },
  features:         { label: 'Features List',        description: 'Bullet points shown on the pricing card, one per entry.' },

  // ── testimonials ──────────────────────────────────────────────────────────
  quote:            { label: 'Testimonial Quote',    description: "The member's own words. No need to add quote marks — they're added automatically." },
  authorName:       { label: "Member's Name",        description: 'Full name of the person giving the testimonial.' },
  authorTitle:      { label: 'Member Description',   description: 'Short context, e.g. "Boxing member since 2022" or "Lost 12 kg in 4 months".' },
  rating:           { label: 'Star Rating',          description: 'Rating out of 5.' },
  goal:             { label: 'Training Goal',        description: "Member's primary training goal, e.g. Weight Loss, Competition Prep." },
  isFeatured:       { label: 'Featured?',            description: 'Featured items appear in homepage sections and spotlights.' },

  // ── FAQs ──────────────────────────────────────────────────────────────────
  question:         { label: 'Question',             description: 'The frequently asked question, written as the visitor would phrase it.' },
  answer:           { label: 'Answer',               description: 'Full answer with rich text formatting. You can add bullet lists, bold text, and links.' },
  category:         { label: 'FAQ Category',         description: 'Groups this question with related FAQs on the FAQ page.' },

  // ── posts / journal ───────────────────────────────────────────────────────
  author:           { label: 'Author',               description: 'The person who wrote this post.' },
  tags:             { label: 'Tags',                 description: 'Keywords for filtering and discovery — enter one tag per entry.' },
  readingTimeMinutes: { label: 'Reading Time (minutes)', description: 'Estimated reading time. Leave blank to auto-calculate from word count.' },
  publishedAt:      { label: 'Published Date',       description: 'Date and time this post was published.' },

  // ── gallery ───────────────────────────────────────────────────────────────
  galleryCategory:  { label: 'Gallery Category',     description: 'Organises photos into groups, e.g. "Boxing", "Events", "Before & After".' },

  // ── redirects ─────────────────────────────────────────────────────────────
  from:             { label: 'Old URL (redirect from)', description: 'The old URL path to redirect away from, e.g. /old-page.' },
  to:               { label: 'New URL (redirect to)',   description: 'The destination URL, e.g. /new-page or a full https:// URL.' },
  statusCode:       { label: 'Redirect Type',          description: 'Permanent (301) = moved forever. Temporary (302) = short-term redirect.' },

  // ── partners ──────────────────────────────────────────────────────────────
  url:              { label: 'Website URL',          description: 'Full URL including https://' },
  website:          { label: 'Website URL',          description: 'Full website URL including https://' },

  // ── UI strings ────────────────────────────────────────────────────────────
  skipLinkLabel:        { label: '"Skip to Content" Link Text', description: 'Accessibility link at the top of every page (screen readers).' },
  searchPlaceholder:    { label: 'Search Placeholder Text',     description: 'Placeholder shown inside the search input field.' },
  filterNoResults:      { label: '"No Results" Message',        description: 'Message shown when a filter or search returns nothing.' },
  loadMoreLabel:        { label: '"Load More" Button Text',      description: 'Text on the pagination load-more button.' },
  bookNowLabel:         { label: '"Book Now" Button Text',       description: 'Text on booking buttons throughout the site.' },
  viewDetailsLabel:     { label: '"View Details" Link Text',     description: 'Text on card detail link buttons.' },
  fullBadge:            { label: '"Class Full" Badge Text',      description: 'Badge shown on fully booked schedule slots.' },
  spotsLeftTemplate:    { label: '"Spots Left" Template',        description: 'Template text — use {n} as a placeholder, e.g. "{n} spots left".' },
  introSkipLabel:       { label: '"Skip Intro" Button Text',     description: 'Text on the button that skips the intro animation.' },
  cookieNotice:         { label: 'Cookie Notice Text',           description: 'Text shown in the cookie consent banner.' },
  formSuccessDefault:   { label: 'Default Form Success Message', description: 'Shown after any form is submitted successfully.' },
  formErrorDefault:     { label: 'Default Form Error Message',   description: 'Shown when a form submission fails.' },
  notFoundHeading:      { label: '404 Page Heading',             description: 'Main heading on the "Page Not Found" error page.' },
  notFoundBody:         { label: '404 Page Body Text',           description: 'Body text on the 404 page.' },
  errorHeading:         { label: 'Error Page Heading',           description: 'Main heading on the generic error page.' },
  errorBody:            { label: 'Error Page Body Text',         description: 'Body text on the error page.' },

  // ── page builder ──────────────────────────────────────────────────────────
  sections:         { label: 'Page Sections',        description: 'Build the page layout by adding and reordering sections. Each section type creates a different visual block.' },
  visible:          { label: 'Visible on Page?',     description: 'Untick to hide this section without deleting it.' },
  anchorId:         { label: 'Section Anchor ID',    description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.' },

  // ── sort ──────────────────────────────────────────────────────────────────
  sortOrder:        { label: 'Sort Order',            description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.' },
};

// ---------------------------------------------------------------------------
// Fields to upgrade to Blocks rich text if they are currently plain "string"
// ---------------------------------------------------------------------------
const UPGRADE_TO_BLOCKS = new Set(['description', 'bio', 'body', 'content', 'answer']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function applyMeta(attributes) {
  if (!attributes || typeof attributes !== 'object') return attributes;

  for (const [fieldName, attr] of Object.entries(attributes)) {
    if (!attr || typeof attr !== 'object') continue;

    const meta = FIELD_META[fieldName];

    if (meta) {
      attr.pluginOptions = attr.pluginOptions ?? {};
      attr.pluginOptions['content-manager'] = {
        ...(attr.pluginOptions['content-manager'] ?? {}),
        label:       meta.label,
        description: meta.description,
      };
    }

    // Upgrade plain string to blocks for long-form fields
    if (attr.type === 'string' && UPGRADE_TO_BLOCKS.has(fieldName)) {
      attr.type = 'blocks';
      // blocks fields don't use minLength / maxLength / regex
      delete attr.minLength;
      delete attr.maxLength;
      delete attr.regex;
      delete attr.default;
    }
  }

  return attributes;
}

function processSchema(filePath) {
  const raw    = fs.readFileSync(filePath, 'utf8');
  const schema = JSON.parse(raw);

  if (schema.attributes) {
    applyMeta(schema.attributes);
  }

  const updated = JSON.stringify(schema, null, 2) + '\n';
  if (updated !== raw) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Walk API schemas and component schemas
// ---------------------------------------------------------------------------
let updated = 0;
let skipped = 0;

// API content types
const apiRoot = path.join(cmsRoot, 'api');
for (const apiName of fs.readdirSync(apiRoot)) {
  const ctDir = path.join(apiRoot, apiName, 'content-types', apiName);
  const file  = path.join(ctDir, 'schema.json');
  if (fs.existsSync(file)) {
    if (processSchema(file)) { updated++; console.log('  updated:', apiName); }
    else { skipped++; }
  }
}

// Component schemas
const compRoot = path.join(cmsRoot, 'components');
for (const category of fs.readdirSync(compRoot)) {
  const catDir = path.join(compRoot, category);
  if (!fs.statSync(catDir).isDirectory()) continue;
  for (const file of fs.readdirSync(catDir)) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(catDir, file);
    if (processSchema(filePath)) { updated++; console.log('  updated:', category + '/' + file); }
    else { skipped++; }
  }
}

console.log(`\nDone: ${updated} updated, ${skipped} already up-to-date.`);
