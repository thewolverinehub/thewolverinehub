/**
 * cm-labels.ts
 * Writes human-readable field labels + descriptions into the Strapi v5
 * content-manager configuration store so the admin UI shows them correctly.
 *
 * Strapi v5 stores content-manager field metadata in the DB (not in schema.json).
 * This bootstrap runs once per startup and is idempotent — it only writes when
 * the current stored label differs from our desired label.
 */

import type { Core } from '@strapi/strapi';

// ---------------------------------------------------------------------------
// Field label + description map (keyed by field name, applies across all types)
// ---------------------------------------------------------------------------
const FIELD_META: Record<string, { label: string; description?: string }> = {
  // identifiers
  title:           { label: 'Title',                  description: 'Display title shown on the page.' },
  name:            { label: 'Name',                   description: 'Full display name.' },
  slug:            { label: 'URL Slug',               description: 'Auto-generated from the title. Sets the page URL path, e.g. /our-coaches.' },

  // text / copy
  tagline:         { label: 'Tagline',                description: 'Short punchy line shown beneath the title (one sentence max).' },
  shortBio:        { label: 'Short Bio',              description: 'Brief bio for card previews — 1 to 2 sentences.' },
  bio:             { label: 'Full Biography',         description: 'Full biography with rich text formatting.' },
  description:     { label: 'Description',            description: 'Detailed description — supports rich text, bullet lists, and links.' },
  content:         { label: 'Body Content',           description: 'Main content body — supports rich text, images, and embeds.' },
  body:            { label: 'Body Text',              description: 'Full body text with rich text formatting.' },
  summary:         { label: 'Short Summary',          description: 'Brief summary shown in listings and search results (plain text, 1–2 sentences).' },
  caption:         { label: 'Caption',                description: 'Short caption displayed below the image.' },
  alt:             { label: 'Alt Text',               description: 'Describe the image for screen readers and SEO.' },
  notes:           { label: 'Internal Notes',         description: 'Private team notes — not shown on the public website.' },
  copyrightText:   { label: 'Copyright Line',         description: 'Copyright notice. Use {year} as a placeholder, e.g. "© {year} The Wolverine Hub".' },
  wordmarkText:    { label: 'Footer Wordmark',        description: 'Large brand text shown as a background watermark in the footer.' },
  headline:        { label: 'Main Headline',          description: 'Large hero headline — keep it punchy, under 6 words.' },
  subheadline:     { label: 'Subheadline',            description: 'Supporting copy beneath the headline (1–2 sentences).' },
  eyebrow:         { label: 'Eyebrow Text',           description: 'Small label shown above the heading (e.g. "Train", "About", "Membership").' },
  subheading:      { label: 'Subheading',             description: 'Supporting sentence shown below the heading (1–2 sentences max).' },

  // media
  image:           { label: 'Image',                  description: 'Upload an image. Preferred format: WebP or AVIF.' },
  video:           { label: 'Background Video',       description: 'Upload the hero video (WebM VP9 + MP4 H.264, muted, ≤ 3 MB).' },
  poster:          { label: 'Video Poster Image',     description: 'Still image shown before the video loads. Must match the video dimensions.' },
  thumbnail:       { label: 'Thumbnail',              description: 'Small preview image used in grids and listings.' },
  photo:           { label: 'Photo',                  description: 'Portrait or profile photo.' },
  coverImage:      { label: 'Cover Image',            description: 'Full-width feature image shown at the top of the page or post.' },
  previewImage:    { label: 'Hover Preview Image',    description: 'Image shown when hovering over this item in the navigation menu.' },
  previewVideo:    { label: 'Hover Preview Video',    description: 'Short looping video shown on hover.' },
  media:           { label: 'Media Asset',            description: 'Image or video file.' },
  logoLight:       { label: 'Logo – Light Version',   description: 'Full logo for dark backgrounds (transparent PNG or SVG).' },
  logoDark:        { label: 'Logo – Dark Version',    description: 'Full logo for light backgrounds (transparent PNG or SVG).' },
  logoMonogram:    { label: 'Logo – Monogram / Icon', description: 'Small square icon used in the mobile header and as the browser icon.' },
  favicon:         { label: 'Favicon',                description: 'Browser tab icon. Recommended: 32 × 32 px PNG or ICO.' },
  icon:            { label: 'Icon',                   description: 'Small decorative icon image.' },
  ogImage:         { label: 'Social Share Image',     description: 'Image shown when the page is shared on social media. Recommended: 1200 × 630 px.' },

  // CTA / buttons
  primaryCta:      { label: 'Primary Action Button',   description: 'Main call-to-action button shown in this section or the header. Leave empty to hide it.' },
  secondaryCta:    { label: 'Secondary Action Button', description: 'Supporting ghost button. Leave empty to hide it.' },
  cta:             { label: 'Action Button',           description: 'Button configuration for this section.' },
  ctaBlock:        { label: 'Call-to-Action Block',    description: 'Optional CTA banner displayed in the footer above the copyright bar.' },
  // shared/cta-button component fields
  label:           { label: 'Button Text',             description: 'Text displayed on the button, e.g. "Start Training".' },
  href:            { label: 'Destination URL',         description: 'Where this button links. Use "/" for homepage or a full https:// URL for external links.' },
  variant:         { label: 'Button Style',            description: 'primary = yellow filled  |  ghost = outline  |  secondary = muted  |  danger = red.' },
  openInNewTab:    { label: 'Open in New Tab?',        description: 'Tick this for external links so the visitor stays on the site.' },

  // navigation
  menuItems:       { label: 'Navigation Menu Items',   description: 'All links shown in the main menu. Drag to reorder.' },
  indexNumber:     { label: 'Menu Index Number',       description: 'Number shown beside the item in the menu, e.g. "01", "02".' },
  subItems:        { label: 'Sub-links',               description: 'Optional secondary links shown below this menu item.' },
  columns:         { label: 'Footer Link Columns',     description: 'Groups of links in the footer. Drag to reorder.' },
  heading:         { label: 'Column Heading',          description: 'Title shown above this group of footer links.' },
  links:           { label: 'Links',                   description: 'List of links in this column.' },
  legalLinks:      { label: 'Legal Footer Links',      description: 'Links in the bottom bar — Privacy Policy, Terms of Service, etc.' },
  url:             { label: 'Website URL',             description: 'Full URL including https://.' },

  // announcement bar
  announcementBarEnabled: { label: 'Show Announcement Bar?',   description: 'Display the banner strip above the main header.' },
  announcementBarText:    { label: 'Announcement Text',         description: 'Message shown in the announcement bar (keep it short — one line).' },
  announcementBarLink:    { label: 'Announcement Link URL',     description: 'Optional destination URL for the bar. Leave blank for no link.' },
  announcementBarColour:  { label: 'Announcement Bar Colour',   description: 'Background colour of the announcement bar.' },

  // newsletter
  newsletterEnabled:    { label: 'Show Newsletter Form?',     description: 'Display the email sign-up form in the footer.' },
  newsletterHeading:    { label: 'Newsletter Heading',         description: 'Heading above the newsletter form, e.g. "Stay in the Loop".' },
  newsletterSubheading: { label: 'Newsletter Subheading',      description: 'Short description below the newsletter heading.' },

  // SEO
  seo:             { label: 'SEO Settings',               description: 'Search engine optimisation settings for this page.' },
  defaultSeo:      { label: 'Default SEO Settings',       description: 'Fallback SEO used when a page has no specific SEO set.' },
  metaTitle:       { label: 'Page Title (SEO)',            description: 'Shown in browser tabs and Google results. Keep under 60 characters.' },
  metaDescription: { label: 'Meta Description',           description: 'Shown in Google results. Keep under 160 characters.' },
  keywords:        { label: 'Keywords',                   description: 'Comma-separated SEO keywords (optional).' },
  canonicalURL:    { label: 'Canonical URL',              description: 'Preferred URL for this page. Leave blank to use the default.' },
  metaRobots:      { label: 'Robots Directive',           description: 'Controls search crawler access, e.g. "noindex, nofollow". Leave blank for normal indexing.' },
  ogTitle:         { label: 'Social Share Title',         description: 'Title when sharing on social media. Defaults to Page Title if empty.' },
  ogDescription:   { label: 'Social Share Description',   description: 'Description when sharing. Defaults to Meta Description if empty.' },
  twitterCard:     { label: 'Twitter / X Card Type',      description: '"Summary" = small image, "Summary Large Image" = large banner.' },
  structuredData:  { label: 'Structured Data (JSON-LD)',   description: 'Advanced: paste a JSON-LD object for rich Google search results.' },

  // site / global settings
  siteName:          { label: 'Site Name',              description: 'Official site name used in browser tabs and SEO, e.g. "The Wolverine Hub".' },
  siteTagline:       { label: 'Brand Tagline',          description: 'Short tagline shown under the logo in certain layouts.' },
  email:             { label: 'Contact Email',          description: 'Main contact email address displayed on the site.' },
  phone:             { label: 'Phone Number',           description: 'Contact number including country code, e.g. +94 77 123 4567.' },
  whatsapp:          { label: 'WhatsApp Number',        description: 'WhatsApp number including country code with no spaces, e.g. +94771234567.' },
  address:           { label: 'Physical Address',       description: 'Full postal address shown on the Contact page.' },
  mapLink:           { label: 'Google Maps URL',        description: 'Link to the location on Google Maps.' },
  hoursJson:         { label: 'Opening Hours (JSON)',   description: 'Opening hours as a JSON object, e.g. {"Monday": "6am–9pm", "Tuesday": "6am–9pm"}.' },
  instagram:         { label: 'Instagram Username',     description: 'Instagram handle without the @ symbol.' },
  facebook:          { label: 'Facebook Page URL',      description: 'Full Facebook page URL.' },
  youtube:           { label: 'YouTube Channel URL',    description: 'Full YouTube channel URL.' },
  tiktok:            { label: 'TikTok Username',        description: 'TikTok handle without the @ symbol.' },
  twitterHandle:     { label: 'Twitter / X Handle',    description: 'Twitter/X username without the @ symbol.' },
  companyNumber:     { label: 'Company Registration Number', description: 'Used in legal footer notices.' },

  // experience toggles
  experienceIntroAnimation:  { label: 'Enable Intro Animation',  description: 'Show the full-screen cinematic intro sequence on first visit.' },
  experienceWebgl:           { label: 'Enable WebGL Effects',    description: 'Enable 3D / shader effects in the hero. Disable for better performance on low-end devices.' },
  experienceSmoothScroll:    { label: 'Enable Smooth Scroll',    description: 'Enable GSAP ScrollSmoother on desktop browsers.' },
  experienceCustomCursor:    { label: 'Enable Custom Cursor',    description: 'Show a custom cursor on desktop (auto-disabled on touch devices).' },
  experienceSoundDefault:    { label: 'Sound On by Default',     description: 'Play ambient sound automatically — not recommended, leave off.' },
  experienceMotionIntensity: { label: 'Motion Intensity',        description: 'Full = all animations  |  Lite = subtle only  |  Minimal = static layout.' },

  // classes
  durationMinutes: { label: 'Duration (minutes)',       description: 'Class length in minutes, e.g. 60 for one hour.' },
  intensity:       { label: 'Intensity Level',          description: 'How physically demanding this class is: Low, Medium, High, or Extreme.' },
  level:           { label: 'Experience Level',         description: 'Who this class suits: Beginner, Intermediate, Advanced, or All Levels.' },
  discipline:      { label: 'Discipline',               description: 'The martial art or training style this class belongs to.' },
  disciplines:     { label: 'Disciplines Taught',       description: 'Martial arts or training styles this coach teaches.' },
  isFree:          { label: 'Free Class?',              description: 'Tick if this class is free and does not require a membership or pass.' },

  // coaches
  role:            { label: 'Role / Title',             description: 'Job title shown on the coach card, e.g. "Head Boxing Coach".' },
  yearsExperience: { label: 'Years of Experience',      description: 'Total years of coaching or competition experience.' },
  specialties:     { label: 'Specialties',              description: 'Key skills or techniques — enter one per line.' },
  isHeadCoach:     { label: 'Head Coach?',              description: 'Mark as Head Coach to feature this person prominently on the Coaches page.' },

  // schedule
  weekday:         { label: 'Day of Week',              description: 'Which day this slot runs every week.' },
  startTime:       { label: 'Start Time',               description: 'Time the class begins in 24-hour format, e.g. 06:00.' },
  endTime:         { label: 'End Time',                 description: 'Time the class ends in 24-hour format, e.g. 07:00.' },
  capacity:        { label: 'Maximum Capacity',         description: 'Maximum number of participants allowed per session.' },
  room:            { label: 'Room / Area',              description: 'Which part of the gym this runs in, e.g. "Main Floor" or "Boxing Ring".' },
  isActive:        { label: 'Active on Schedule?',      description: 'Only active slots are shown on the public schedule page.' },

  // pricing
  tier:            { label: 'Pricing Tier',             description: 'The membership tier this pass belongs to.' },
  duration:        { label: 'Duration Label',           description: 'Human-readable duration shown to customers, e.g. "1 Month" or "3 Months".' },
  durationDays:    { label: 'Duration in Days',         description: 'Exact number of days — used to calculate pass expiry.' },
  priceLKR:        { label: 'Price (LKR)',              description: 'Price in Sri Lankan Rupees. Do not include commas or currency symbols.' },
  payHereItemName: { label: 'PayHere Item Name',        description: 'Short item name for the PayHere payment gateway. No special characters.' },
  isPurchasable:   { label: 'Available for Purchase?',  description: 'If unticked, this pass is hidden from the pricing page.' },
  isMostPopular:   { label: 'Most Popular?',            description: 'Adds a "Most Popular" badge to highlight this tier.' },
  colour:          { label: 'Accent Colour',            description: 'Colour used to style this card: Yellow, Blue, Red, or White.' },
  features:        { label: 'Features List',            description: 'Bullet points shown on the pricing card — one per entry.' },
  sessions:        { label: 'Number of Sessions',       description: 'How many personal training or add-on sessions are included.' },
  validityDays:    { label: 'Valid For (days)',          description: 'How many days this pack remains valid after purchase.' },
  tokens:          { label: 'Class Tokens',             description: 'Number of class tokens included in this pack.' },

  // testimonials
  quote:           { label: 'Testimonial Quote',        description: "The member's words. No need to add quote marks — they are added automatically by the design." },
  authorName:      { label: "Member's Name",            description: 'Full name of the person giving the testimonial.' },
  authorTitle:     { label: 'Member Description',       description: 'Short context, e.g. "Boxing member since 2022" or "Lost 12 kg in 4 months".' },
  rating:          { label: 'Star Rating',              description: 'Rating out of 5.' },
  goal:            { label: 'Training Goal',            description: "Member's primary training goal, e.g. Weight Loss, Competition Prep." },
  isFeatured:      { label: 'Featured?',               description: 'Featured items appear in homepage sections and spotlights.' },

  // FAQs
  question:        { label: 'Question',                 description: 'The frequently asked question — write it as the visitor would phrase it.' },
  answer:          { label: 'Answer',                   description: 'Full answer with rich text formatting. You can use bullet lists, bold text, and links.' },
  category:        { label: 'Category',                 description: 'Groups this question with related FAQs on the FAQ page.' },

  // posts
  author:          { label: 'Author',                   description: 'The person who wrote this post.' },
  tags:            { label: 'Tags',                     description: 'Keywords for filtering and discovery — enter one tag per entry.' },
  readingTimeMinutes: { label: 'Reading Time (minutes)', description: 'Estimated reading time. Leave blank to auto-calculate from word count.' },

  // gallery
  galleryCategory: { label: 'Gallery Category',         description: 'Organises photos into groups, e.g. "Boxing", "Events", "Before & After".' },

  // redirects
  from:            { label: 'Old URL (redirect from)',  description: 'The old URL path to redirect away from, e.g. /old-page.' },
  to:              { label: 'New URL (redirect to)',    description: 'The destination URL, e.g. /new-page or a full https:// external URL.' },
  statusCode:      { label: 'Redirect Type',           description: 'Permanent (301) = moved forever  |  Temporary (302) = short-term redirect.' },

  // UI strings
  skipLinkLabel:        { label: '"Skip to Content" Link Text',    description: 'Accessibility link at the top of every page (used by screen readers).' },
  searchPlaceholder:    { label: 'Search Box Placeholder Text',    description: 'Placeholder shown inside the search input field.' },
  filterNoResults:      { label: '"No Results" Message',           description: 'Shown when a filter or search returns no matches.' },
  loadMoreLabel:        { label: '"Load More" Button Text',        description: 'Text on the pagination "load more" button.' },
  bookNowLabel:         { label: '"Book Now" Button Text',         description: 'Text on booking buttons throughout the site.' },
  viewDetailsLabel:     { label: '"View Details" Link Text',       description: 'Text on card detail link buttons.' },
  fullBadge:            { label: '"Class Full" Badge Text',        description: 'Badge shown on fully booked schedule slots.' },
  spotsLeftTemplate:    { label: '"Spots Left" Template',          description: 'Use {n} as a placeholder, e.g. "{n} spots left".' },
  introSkipLabel:       { label: '"Skip Intro" Button Text',       description: 'Text on the button that skips the intro animation.' },
  cookieNotice:         { label: 'Cookie Notice Text',             description: 'Text shown in the cookie consent banner.' },
  formSuccessDefault:   { label: 'Default Form Success Message',   description: 'Shown after any form is submitted successfully.' },
  formErrorDefault:     { label: 'Default Form Error Message',     description: 'Shown when a form submission fails.' },
  notFoundHeading:      { label: '404 Page Heading',               description: 'Main heading on the "Page Not Found" error page.' },
  notFoundBody:         { label: '404 Page Body Text',             description: 'Body text on the 404 page.' },
  errorHeading:         { label: 'Error Page Heading',             description: 'Main heading on the generic error page.' },
  errorBody:            { label: 'Error Page Body Text',           description: 'Body text on the error page.' },

  // page builder
  sections:        { label: 'Page Sections',            description: 'Build the page layout by adding and reordering sections. Each section creates a different visual block on the page.' },
  visible:         { label: 'Visible on Page?',         description: 'Untick to hide this section without deleting it.' },
  anchorId:        { label: 'Section Anchor ID',        description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.' },

  // sort
  sortOrder:       { label: 'Sort Order',               description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.' },

  // stat counter
  value:           { label: 'Stat Value',               description: 'The number or text displayed in large format, e.g. "24" or "5+".'},
  prefix:          { label: 'Prefix',                   description: 'Text shown before the value, e.g. "Over" or "~".' },
  suffix:          { label: 'Suffix',                   description: 'Text shown after the value, e.g. "+" or "members".' },

  // form / lead
  formKey:         { label: 'Form Key',                 description: 'Internal identifier for this form, e.g. "contact" or "free-trial".' },
  successMessage:  { label: 'Success Message',          description: 'Message shown after a successful form submission.' },
  errorMessage:    { label: 'Error Message',            description: 'Message shown when a form submission fails.' },
  consentText:     { label: 'Consent / GDPR Text',     description: 'Checkbox label text for data consent, e.g. "I agree to the privacy policy."' },
  recipientEmails: { label: 'Recipient Emails (JSON)',  description: 'JSON array of email addresses to notify, e.g. ["[email protected]"].' },
  message:         { label: 'Message',                  description: 'The message or enquiry the visitor submitted.' },
  ipHash:          { label: 'IP Hash (rate limiting)',  description: 'Hashed visitor IP address used for spam rate limiting. Do not edit.' },
  status:          { label: 'Lead Status',              description: 'Tracks where this enquiry is in your follow-up workflow.' },
  fields:          { label: 'Extra Fields (JSON)',      description: 'Additional form field data stored as JSON.' },
};

// ---------------------------------------------------------------------------
// RICH-TEXT field upgrades to apply if a field is currently "string" / "text"
// (only relevant when writing initial config — type is already blocks in schema)
// ---------------------------------------------------------------------------
const SEARCHABLE_TYPES = new Set(['string', 'email', 'uid', 'enumeration']);
const SORTABLE_TYPES   = new Set(['string', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'uid', 'float', 'biginteger']);

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export async function applyContentManagerLabels(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'content-manager' });

  // Iterate every registered content type (both api:: and plugin::)
  const uids = Object.keys(strapi.contentTypes).filter((u) => u.startsWith('api::'));

  let updated = 0;

  for (const uid of uids) {
    const key = `configuration_content-types::${uid}`;

    // Get whatever is stored (may be null on first startup)
    const existing = (await store.get({ key })) as ContentManagerConfig | null;

    const schema        = (strapi.contentTypes as Record<string, any>)[uid];
    const rawAttributes = schema?.attributes ?? {};

    // Build metadatas: start from existing, then merge our labels
    const metadatas: Record<string, FieldMeta> = { ...(existing?.metadatas ?? {}) };

    let dirty = false;

    for (const [fieldName, attr] of Object.entries(rawAttributes)) {
      const meta  = FIELD_META[fieldName];
      if (!meta) continue;

      const current  = metadatas[fieldName] ?? { edit: {}, list: {} };
      const attrType = (attr as { type: string }).type;

      const newEdit = {
        ...current.edit,
        label:       meta.label,
        description: meta.description ?? '',
        placeholder: current.edit?.placeholder ?? '',
        visible:     current.edit?.visible     ?? true,
        editable:    current.edit?.editable    ?? true,
      };

      const newList = {
        ...current.list,
        label:      meta.label,
        searchable: current.list?.searchable ?? SEARCHABLE_TYPES.has(attrType),
        sortable:   current.list?.sortable   ?? SORTABLE_TYPES.has(attrType),
      };

      if (
        current.edit?.label !== newEdit.label ||
        current.edit?.description !== newEdit.description
      ) {
        metadatas[fieldName] = { edit: newEdit, list: newList };
        dirty = true;
      }
    }

    if (!dirty) continue;

    const newConfig: ContentManagerConfig = {
      uid,
      settings: existing?.settings ?? {
        bulkable: true, filterable: true, searchable: true,
        pageSize: 10, mainField: 'title' in rawAttributes ? 'title' : ('name' in rawAttributes ? 'name' : 'id'),
        defaultSortBy: 'id', defaultSortOrder: 'ASC',
      },
      metadatas,
      layouts: existing?.layouts ?? { list: ['id', 'createdAt', 'updatedAt'], edit: [] },
    };

    await store.set({ key, value: newConfig });
    strapi.log.info(`[bootstrap] Applied content-manager labels for ${uid}`);
    updated++;
  }

  // ── Components (sections.*, shared.*, etc.) ──────────────────────────────
  // For component fields we prefer the label declared in the schema's
  // pluginOptions["content-manager"].label before falling back to FIELD_META.
  const componentUids = Object.keys(strapi.components ?? {});

  for (const uid of componentUids) {
    const key = `configuration_components::${uid}`;
    const existing = (await store.get({ key })) as ContentManagerConfig | null;
    const schema = (strapi.components as Record<string, any>)[uid];
    const rawAttributes = schema?.attributes ?? {};

    const metadatas: Record<string, FieldMeta> = { ...(existing?.metadatas ?? {}) };
    let dirty = false;

    for (const [fieldName, attr] of Object.entries(rawAttributes)) {
      const schemaLabel = (attr as any)?.pluginOptions?.['content-manager']?.label as string | undefined;
      const schemaDesc  = (attr as any)?.pluginOptions?.['content-manager']?.description as string | undefined;
      const fieldMeta   = FIELD_META[fieldName];

      const wantedLabel = schemaLabel ?? fieldMeta?.label;
      const wantedDesc  = schemaDesc  ?? fieldMeta?.description ?? '';
      if (!wantedLabel) continue;

      const current  = metadatas[fieldName] ?? { edit: {}, list: {} };
      const attrType = (attr as { type: string }).type;

      const newEdit = {
        ...current.edit,
        label:       wantedLabel,
        description: wantedDesc,
        placeholder: current.edit?.placeholder ?? '',
        visible:     current.edit?.visible     ?? true,
        editable:    current.edit?.editable    ?? true,
      };
      const newList = {
        ...current.list,
        label:      wantedLabel,
        searchable: current.list?.searchable ?? SEARCHABLE_TYPES.has(attrType),
        sortable:   current.list?.sortable   ?? SORTABLE_TYPES.has(attrType),
      };

      if (current.edit?.label !== newEdit.label || current.edit?.description !== newEdit.description) {
        metadatas[fieldName] = { edit: newEdit, list: newList };
        dirty = true;
      }
    }

    if (!dirty) continue;

    const newConfig: ContentManagerConfig = {
      uid,
      settings: existing?.settings ?? {
        bulkable: true, filterable: true, searchable: true,
        pageSize: 10, mainField: 'title' in rawAttributes ? 'title' : ('name' in rawAttributes ? 'name' : 'id'),
        defaultSortBy: 'id', defaultSortOrder: 'ASC',
      },
      metadatas,
      layouts: existing?.layouts ?? { list: [], edit: [] },
    };

    await store.set({ key, value: newConfig });
    strapi.log.info(`[bootstrap] Applied content-manager labels for component ${uid}`);
    updated++;
  }

  if (updated === 0) {
    strapi.log.info('[bootstrap] Content-manager labels already up to date');
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface FieldEdit {
  label?: string;
  description?: string;
  placeholder?: string;
  visible?: boolean;
  editable?: boolean;
}
interface FieldList {
  label?: string;
  searchable?: boolean;
  sortable?: boolean;
}
interface FieldMeta {
  edit: FieldEdit;
  list: FieldList;
}
interface ContentManagerConfig {
  uid: string;
  settings: Record<string, unknown>;
  metadatas: Record<string, FieldMeta>;
  layouts: Record<string, unknown>;
}
