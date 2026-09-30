import type { Schema, Struct } from '@strapi/strapi';

export interface NavigationFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_navigation_footer_columns';
  info: {
    displayName: 'Footer Column';
    icon: 'layer';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface NavigationMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_navigation_menu_items';
  info: {
    displayName: 'Menu Item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String & Schema.Attribute.Required;
    indexNumber: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    previewImage: Schema.Attribute.Media<'images'>;
    previewVideo: Schema.Attribute.Media<'videos'>;
    subItems: Schema.Attribute.Component<'shared.link', true>;
  };
}

export interface SectionsAppFeatures extends Struct.ComponentSchema {
  collectionName: 'components_sections_app_features';
  info: {
    displayName: 'App Features';
    icon: 'apps';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    comingSoon: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    features: Schema.Attribute.JSON;
    heading: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsClassRail extends Struct.ComponentSchema {
  collectionName: 'components_sections_class_rails';
  info: {
    displayName: 'Class Rail';
    icon: 'grid';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCoachCarousel extends Struct.ComponentSchema {
  collectionName: 'components_sections_coach_carousels';
  info: {
    displayName: 'Coach Carousel';
    icon: 'slideshow';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCoachSpotlight extends Struct.ComponentSchema {
  collectionName: 'components_sections_coach_spotlights';
  info: {
    displayName: 'Coach Spotlight';
    icon: 'user';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_banners';
  info: {
    displayName: 'CTA Banner';
    icon: 'megaphone';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundToken: Schema.Attribute.Enumeration<
      ['black', 'ink', 'blue', 'red', 'yellow']
    > &
      Schema.Attribute.DefaultTo<'blue'>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    primaryCta: Schema.Attribute.Component<'shared.cta-button', false>;
    secondaryCta: Schema.Attribute.Component<'shared.cta-button', false>;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFaqBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_blocks';
  info: {
    displayName: 'FAQ Block';
    icon: 'question';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<5>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFeatureSplit extends Struct.ComponentSchema {
  collectionName: 'components_sections_feature_splits';
  info: {
    displayName: 'Feature Split';
    icon: 'layer';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundToken: Schema.Attribute.Enumeration<
      ['black', 'ink', 'blue', 'white']
    > &
      Schema.Attribute.DefaultTo<'black'>;
    body: Schema.Attribute.Blocks;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    media: Schema.Attribute.Component<'shared.media-with-alt', false>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsGalleryGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_gallery_grids';
  info: {
    displayName: 'Gallery Grid';
    icon: 'picture';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<12>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsHeroVideo extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_videos';
  info: {
    displayName: 'Hero Video';
    icon: 'play';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    poster: Schema.Attribute.Media<'images'>;
    primaryCta: Schema.Attribute.Component<'shared.cta-button', false>;
    secondaryCta: Schema.Attribute.Component<'shared.cta-button', false>;
    subheadline: Schema.Attribute.Text;
    video: Schema.Attribute.Media<'videos'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsLocationBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_location_blocks';
  info: {
    displayName: 'Location Block';
    icon: 'pinMap';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    mapEmbedUrl: Schema.Attribute.String;
    mapImage: Schema.Attribute.Media<'images'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsMarquee extends Struct.ComponentSchema {
  collectionName: 'components_sections_marquees';
  info: {
    displayName: 'Marquee';
    icon: 'arrowRight';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    speed: Schema.Attribute.Enumeration<['slow', 'normal', 'fast']> &
      Schema.Attribute.DefaultTo<'normal'>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsNewsletterBlock extends Struct.ComponentSchema {
  collectionName: 'components_sections_newsletter_blocks';
  info: {
    displayName: 'Newsletter Block';
    icon: 'envelop';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    consentText: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    inputPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Your email address'>;
    subheading: Schema.Attribute.Text;
    submitLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Join the Pack'>;
    successMessage: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsPartnerStrip extends Struct.ComponentSchema {
  collectionName: 'components_sections_partner_strips';
  info: {
    displayName: 'Partner Strip';
    icon: 'handHeart';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsPricingTeaser extends Struct.ComponentSchema {
  collectionName: 'components_sections_pricing_teasers';
  info: {
    displayName: 'Pricing Teaser';
    icon: 'priceTag';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsProgramTiers extends Struct.ComponentSchema {
  collectionName: 'components_sections_program_tiers';
  info: {
    displayName: 'Program Tiers';
    icon: 'star';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    cta: Schema.Attribute.Component<'shared.cta-button', false>;
    heading: Schema.Attribute.String;
    subheading: Schema.Attribute.Text;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsRichText extends Struct.ComponentSchema {
  collectionName: 'components_sections_rich_texts';
  info: {
    displayName: 'Rich Text';
    icon: 'file';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    backgroundToken: Schema.Attribute.Enumeration<['black', 'ink', 'white']> &
      Schema.Attribute.DefaultTo<'black'>;
    content: Schema.Attribute.Blocks & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsScrollChapter extends Struct.ComponentSchema {
  collectionName: 'components_sections_scroll_chapters';
  info: {
    displayName: 'Scroll Chapter';
    icon: 'book';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    chapters: Schema.Attribute.JSON & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsStatCounters extends Struct.ComponentSchema {
  collectionName: 'components_sections_stat_counters';
  info: {
    displayName: 'Stat Counters';
    icon: 'chartCircle';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    stats: Schema.Attribute.JSON & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsTestimonialSlider extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonial_sliders';
  info: {
    displayName: 'Testimonial Slider';
    icon: 'quote';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    maxItems: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<6>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsTriptych extends Struct.ComponentSchema {
  collectionName: 'components_sections_triptychs';
  info: {
    displayName: 'Triptych';
    icon: 'layout';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    panels: Schema.Attribute.JSON & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsVideoFeature extends Struct.ComponentSchema {
  collectionName: 'components_sections_video_features';
  info: {
    displayName: 'Video Feature';
    icon: 'play';
  };
  attributes: {
    anchorId: Schema.Attribute.String;
    caption: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    poster: Schema.Attribute.Media<'images'>;
    video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_cta_buttons';
  info: {
    displayName: 'CTA Button';
    icon: 'cursor';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    variant: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'ghost', 'danger']
    > &
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
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface SharedMediaWithAlt extends Struct.ComponentSchema {
  collectionName: 'components_shared_media_with_alts';
  info: {
    displayName: 'Media with Alt';
    icon: 'landscape';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    caption: Schema.Attribute.String;
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
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaRobots: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    > &
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
