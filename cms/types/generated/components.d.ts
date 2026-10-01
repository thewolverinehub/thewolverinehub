import type { Schema, Struct } from '@strapi/strapi';

export interface NavigationFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_navigation_footer_columns';
  info: {
    displayName: 'Footer Column';
    icon: 'layer';
  };
  attributes: {
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    links: Schema.Attribute.Component<'shared.link', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'List of links in this column.';
          label: 'Links';
        };
      }>;
  };
}

export interface NavigationMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_menu_items';
  info: {
    displayName: 'Menu Item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Detailed description with rich text formatting.';
          label: 'Description';
        };
      }>;
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Where the button links. Use "/" for homepage or a full URL for external links.';
          label: 'Destination URL';
        };
      }>;
    indexNumber: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Number displayed next to the item in the menu (e.g. "01", "02").';
          label: 'Index Number';
        };
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text displayed on the button (e.g. "Start Training").';
          label: 'Button Text';
        };
      }>;
    previewImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Image shown when hovering over this item in the navigation menu.';
          label: 'Hover Preview Image';
        };
      }>;
    previewVideo: Schema.Attribute.Media<'videos'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short looping video shown when hovering over this item.';
          label: 'Hover Preview Video';
        };
      }>;
    subItems: Schema.Attribute.Component<'shared.link', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional secondary links shown below this menu item.';
          label: 'Sub-links';
        };
      }>;
  };
}

export interface SectionsAppFeatures extends Struct.ComponentSchema {
  collectionName: 'components_sections_app_features';
  info: {
    displayName: 'App Features';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    comingSoon: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    features: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Bullet points shown on the pricing card, one per entry.';
          label: 'Features List';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsClassRail extends Struct.ComponentSchema {
  collectionName: 'components_sections_class_rails';
  info: {
    displayName: 'Class Rail';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCoachCarousel extends Struct.ComponentSchema {
  collectionName: 'components_sections_coach_carousels';
  info: {
    displayName: 'Coach Carousel';
    icon: 'slideshow';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCoachSpotlight extends Struct.ComponentSchema {
  collectionName: 'components_sections_coach_spotlights';
  info: {
    displayName: 'Coach Spotlight';
    icon: 'user';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_banners';
  info: {
    displayName: 'CTA Banner';
    icon: 'megaphone';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    backgroundToken: Schema.Attribute.Enumeration<
      ['black', 'ink', 'blue', 'red', 'yellow']
    > &
      Schema.Attribute.DefaultTo<'blue'>;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    primaryCta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main call-to-action button. Leave empty to hide it.';
          label: 'Primary Action Button';
        };
      }>;
    secondaryCta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Supporting action link or ghost button. Leave empty to hide it.';
          label: 'Secondary Action Button';
        };
      }>;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFaqBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_blocks';
  info: {
    displayName: 'FAQ Block';
    icon: 'question';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFeatureSplit extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_splits';
  info: {
    displayName: 'Feature Split';
    icon: 'layer';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    backgroundToken: Schema.Attribute.Enumeration<
      ['black', 'ink', 'blue', 'white']
    > &
      Schema.Attribute.DefaultTo<'black'>;
    body: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full body text with rich text formatting.';
          label: 'Body Text';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    media: Schema.Attribute.Component<'shared.media-with-alt', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Image or video file.';
          label: 'Media Asset';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsGalleryGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_gallery_grids';
  info: {
    displayName: 'Gallery Grid';
    icon: 'picture';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsHeroVideo extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_videos';
  info: {
    displayName: 'Hero Video';
    icon: 'play';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    headline: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Large hero headline \u2014 keep it punchy, under 6 words.';
          label: 'Main Headline';
        };
      }>;
    poster: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Still image shown before the video loads. Must match the video dimensions.';
          label: 'Video Poster Image';
        };
      }>;
    primaryCta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main call-to-action button. Leave empty to hide it.';
          label: 'Primary Action Button';
        };
      }>;
    secondaryCta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Supporting action link or ghost button. Leave empty to hide it.';
          label: 'Secondary Action Button';
        };
      }>;
    subheadline: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Supporting copy beneath the headline (1\u20132 sentences).';
          label: 'Subheadline';
        };
      }>;
    video: Schema.Attribute.Media<'videos'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Upload the hero video (WebM VP9 + MP4 H.264, muted, \u2264 3 MB).';
          label: 'Background Video';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsLocationBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_location_blocks';
  info: {
    displayName: 'Location Block';
    icon: 'pinMap';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    mapEmbedUrl: Schema.Attribute.String;
    mapImage: Schema.Attribute.Media<'images'>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsMarquee extends Struct.ComponentSchema {
  collectionName: 'components_sections_marquees';
  info: {
    displayName: 'Marquee';
    icon: 'arrowRight';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    speed: Schema.Attribute.Enumeration<['slow', 'normal', 'fast']> &
      Schema.Attribute.DefaultTo<'normal'>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsNewsletterBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_newsletter_blocks';
  info: {
    displayName: 'Newsletter Block';
    icon: 'envelop';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    consentText: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    inputPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your email address'>;
    subheading: Schema.Attribute.Text;
    submitLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Join the Pack'>;
    successMessage: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsPartnerStrip extends Struct.ComponentSchema {
  collectionName: 'components_sections_partner_strips';
  info: {
    displayName: 'Partner Strip';
    icon: 'handHeart';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsPricingTeaser extends Struct.ComponentSchema {
  collectionName: 'components_sections_pricing_teasers';
  info: {
    displayName: 'Pricing Teaser';
    icon: 'priceTag';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsProgramTiers extends Struct.ComponentSchema {
  collectionName: 'components_sections_program_tiers';
  info: {
    displayName: 'Program Tiers';
    icon: 'star';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    cta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Action button configuration for this section.';
          label: 'Call-to-Action Button';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    displayName: 'Rich Text';
    icon: 'file';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    backgroundToken: Schema.Attribute.Enumeration<['black', 'ink', 'white']> &
      Schema.Attribute.DefaultTo<'black'>;
    content: Schema.Attribute.Blocks &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main body of this entry \u2014 supports rich text, images, and embeds.';
          label: 'Body Content';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsScrollChapter extends Struct.ComponentSchema {
  collectionName: 'components_sections_scroll_chapters';
  info: {
    displayName: 'Scroll Chapter';
    icon: 'book';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    chapters: Schema.Attribute.JSON & Schema.Attribute.Required;
    heading: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsStatCounters extends Struct.ComponentSchema {
  collectionName: 'components_sections_stat_counters';
  info: {
    displayName: 'Stat Counters';
    icon: 'chartCircle';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    stats: Schema.Attribute.JSON & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsTestimonialSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonial_sliders';
  info: {
    displayName: 'Testimonial Slider';
    icon: 'quote';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsTriptych extends Struct.ComponentSchema {
  collectionName: 'components_sections_triptychs';
  info: {
    displayName: 'Triptych';
    icon: 'layout';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    panels: Schema.Attribute.JSON & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsVideoFeature extends Struct.ComponentSchema {
  collectionName: 'components_sections_video_features';
  info: {
    displayName: 'Video Feature';
    icon: 'play';
  };
  attributes: {
    anchorId: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional HTML anchor for deep-linking, e.g. "about". Used in URLs like /page#about.';
          label: 'Section Anchor ID';
        };
      }>;
    caption: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short caption displayed below the image.';
          label: 'Caption';
        };
      }>;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title above this group of footer links.';
          label: 'Column Heading';
        };
      }>;
    poster: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Still image shown before the video loads. Must match the video dimensions.';
          label: 'Video Poster Image';
        };
      }>;
    video: Schema.Attribute.Media<'videos'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Upload the hero video (WebM VP9 + MP4 H.264, muted, \u2264 3 MB).';
          label: 'Background Video';
        };
      }>;
    visible: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Untick to hide this section without deleting it.';
          label: 'Visible on Page?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_buttons';
  info: {
    displayName: 'CTA Button';
    icon: 'cursor';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Where the button links. Use "/" for homepage or a full URL for external links.';
          label: 'Destination URL';
        };
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text displayed on the button (e.g. "Start Training").';
          label: 'Button Text';
        };
      }>;
    openInNewTab: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Tick this for external links so the visitor stays on the site.';
          label: 'Open in New Tab?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'ghost', 'danger']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Visual style: primary = yellow filled, ghost = outline, secondary = muted, danger = red.';
          label: 'Button Style';
        };
      }> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    href: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Where the button links. Use "/" for homepage or a full URL for external links.';
          label: 'Destination URL';
        };
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text displayed on the button (e.g. "Start Training").';
          label: 'Button Text';
        };
      }>;
    openInNewTab: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Tick this for external links so the visitor stays on the site.';
          label: 'Open in New Tab?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedMediaWithAlt extends Struct.ComponentSchema {
  collectionName: 'components_shared_media_with_alts';
  info: {
    displayName: 'Media with Alt';
    icon: 'landscape';
  };
  attributes: {
    alt: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Describe the image for screen readers and search engines.';
          label: 'Alt Text';
        };
      }>;
    caption: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short caption displayed below the image.';
          label: 'Caption';
        };
      }>;
    file: Schema.Attribute.Media<'images' | 'videos'> &
      Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Preferred URL if this content exists at multiple paths. Leave blank for default.';
          label: 'Canonical URL';
        };
      }>;
    keywords: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Comma-separated SEO keywords (optional \u2014 not used by most search engines).';
          label: 'Keywords';
        };
      }>;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short description shown in Google results. Keep under 160 characters.';
          label: 'Meta Description';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaRobots: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Controls crawler access, e.g. "noindex, nofollow". Leave blank for normal indexing.';
          label: 'Robots Directive';
        };
      }> &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title shown in browser tabs and Google results. Keep under 60 characters.';
          label: 'Page Title (SEO)';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Description when sharing. Defaults to Meta Description if empty.';
          label: 'Social Share Description';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Image shown when sharing on social media. Recommended: 1200 \u00D7 630 px.';
          label: 'Social Share Image';
        };
      }>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Title when sharing on social media. Defaults to Page Title if empty.';
          label: 'Social Share Title';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    structuredData: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Advanced: paste a JSON-LD object for rich search result snippets.';
          label: 'Structured Data (JSON-LD)';
        };
      }>;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '"Summary" = small image, "Summary Large Image" = big banner.';
          label: 'Twitter / X Card Type';
        };
      }> &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'navigation.footer-column': NavigationFooterColumn;
      'navigation.menu-item': NavigationMenuItem;
      'sections.app-features': SectionsAppFeatures;
      'sections.class-rail': SectionsClassRail;
      'sections.coach-carousel': SectionsCoachCarousel;
      'sections.coach-spotlight': SectionsCoachSpotlight;
      'sections.cta-banner': SectionsCtaBanner;
      'sections.faq-block': SectionsFaqBlock;
      'sections.feature-split': SectionsFeatureSplit;
      'sections.gallery-grid': SectionsGalleryGrid;
      'sections.hero-video': SectionsHeroVideo;
      'sections.location-block': SectionsLocationBlock;
      'sections.marquee': SectionsMarquee;
      'sections.newsletter-block': SectionsNewsletterBlock;
      'sections.partner-strip': SectionsPartnerStrip;
      'sections.pricing-teaser': SectionsPricingTeaser;
      'sections.program-tiers': SectionsProgramTiers;
      'sections.rich-text': SectionsRichText;
      'sections.scroll-chapter': SectionsScrollChapter;
      'sections.stat-counters': SectionsStatCounters;
      'sections.testimonial-slider': SectionsTestimonialSlider;
      'sections.triptych': SectionsTriptych;
      'sections.video-feature': SectionsVideoFeature;
      'shared.cta-button': SharedCtaButton;
      'shared.link': SharedLink;
      'shared.media-with-alt': SharedMediaWithAlt;
      'shared.seo': SharedSeo;
    }
  }
}
