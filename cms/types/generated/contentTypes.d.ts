import type { Schema, Struct } from '@strapi/strapi';

export interface AdminApiToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    adminPermissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::permission'
    >;
    adminUserOwner: Schema.Attribute.Relation<'manyToOne', 'admin::user'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    encryptedKey: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    expiresAt: Schema.Attribute.DateTime;
    kind: Schema.Attribute.Enumeration<['content-api', 'admin']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'content-api'>;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Schema.Attribute.DefaultTo<'read-only'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::api-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminPermission extends Struct.CollectionTypeSchema {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    apiToken: Schema.Attribute.Relation<'manyToOne', 'admin::api-token'>;
    conditions: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<[]>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::permission'> &
      Schema.Attribute.Private;
    properties: Schema.Attribute.JSON & Schema.Attribute.DefaultTo<{}>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<'manyToOne', 'admin::role'>;
    subject: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminRole extends Struct.CollectionTypeSchema {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::role'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<'oneToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<'manyToMany', 'admin::user'>;
  };
}

export interface AdminSession extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_sessions';
  info: {
    description: 'Session Manager storage';
    displayName: 'Session';
    name: 'Session';
    pluralName: 'sessions';
    singularName: 'session';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
    i18n: {
      localized: false;
    };
  };
  attributes: {
    absoluteExpiresAt: Schema.Attribute.DateTime & Schema.Attribute.Private;
    childId: Schema.Attribute.String & Schema.Attribute.Private;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    deviceId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    expiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::session'> &
      Schema.Attribute.Private;
    metadata: Schema.Attribute.JSON & Schema.Attribute.Private;
    origin: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sessionId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique;
    status: Schema.Attribute.String & Schema.Attribute.Private;
    type: Schema.Attribute.String & Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    userId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferToken extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Schema.Attribute.DefaultTo<''>;
    expiresAt: Schema.Attribute.DateTime;
    lastUsedAt: Schema.Attribute.DateTime;
    lifespan: Schema.Attribute.BigInteger;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminTransferTokenPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'admin::transfer-token-permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    token: Schema.Attribute.Relation<'manyToOne', 'admin::transfer-token'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface AdminUser extends Struct.CollectionTypeSchema {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    apiTokens: Schema.Attribute.Relation<'oneToMany', 'admin::api-token'> &
      Schema.Attribute.Private;
    blocked: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.Private &
      Schema.Attribute.DefaultTo<false>;
    lastname: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'admin::user'> &
      Schema.Attribute.Private;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    registrationToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    resetPasswordTokenExpiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.Private;
    roles: Schema.Attribute.Relation<'manyToMany', 'admin::role'> &
      Schema.Attribute.Private;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String;
  };
}

export interface ApiAddOnAddOn extends Struct.CollectionTypeSchema {
  collectionName: 'add_ons';
  info: {
    description: 'An optional add-on product (e.g. personal training session, nutrition consult).';
    displayName: 'Add-on';
    pluralName: 'add-ons';
    singularName: 'add-on';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Detailed description with rich text formatting.';
          label: 'Description';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::add-on.add-on'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    payHereItemName: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short item name sent to the PayHere payment gateway. No special characters.';
          label: 'PayHere Item Name';
        };
      }>;
    priceLKR: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Price in Sri Lankan Rupees. Do not include commas or currency symbols.';
          label: 'Price (LKR)';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sessions: Schema.Attribute.Integer & Schema.Attribute.Required;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    validityDays: Schema.Attribute.Integer;
  };
}

export interface ApiAmenityAmenity extends Struct.CollectionTypeSchema {
  collectionName: 'amenities';
  info: {
    description: 'A gym facility or amenity (e.g. Showers, Sauna, Parking) shown on the Contact/About page.';
    displayName: 'Amenity';
    pluralName: 'amenities';
    singularName: 'amenity';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    icon: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Small decorative icon image.';
          label: 'Icon';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::amenity.amenity'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiAuthorAuthor extends Struct.CollectionTypeSchema {
  collectionName: 'authors';
  info: {
    description: 'A blog post author \u2014 name, bio, photo, and links.';
    displayName: 'Author';
    pluralName: 'authors';
    singularName: 'author';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bio: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full biography with rich text formatting.';
          label: 'Full Biography';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::author.author'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    photo: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Portrait or profile photo.';
          label: 'Photo';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiBookingBooking extends Struct.CollectionTypeSchema {
  collectionName: 'bookings';
  info: {
    description: "One member's booking for one dated session of a class. Created by the website \u2014 you normally only view or cancel these.";
    displayName: 'Booking';
    pluralName: 'bookings';
    singularName: 'booking';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    amount: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Price charged for this booking.';
          label: 'Amount (LKR)';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    cancelledAt: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Cancelled At';
        };
      }>;
    classDocumentId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'documentId of the booked class.';
          label: 'Class (id)';
        };
      }>;
    classNameSnapshot: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Copied when booked.';
          label: 'Class Name (at booking)';
        };
      }>;
    classSlug: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Class (slug)';
        };
      }>;
    confirmationSentAt: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Confirmation Email Sent';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'LKR'>;
    endTime: Schema.Attribute.Time &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Copied from the slot when booked.';
          label: 'End Time';
        };
      }>;
    holdExpiresAt: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'A pending booking holds its seat until this time.';
          label: 'Seat Held Until';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::booking.booking'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Internal notes (not shown to the member).';
          label: 'Notes';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    reference: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short code the member sees, e.g. TWH-7F3K9Q.';
          label: 'Booking Reference';
        };
      }>;
    reminderSentAt: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Reminder Email Sent';
        };
      }>;
    sessionDate: Schema.Attribute.Date &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The calendar date of the session (Sri Lanka).';
          label: 'Session Date';
        };
      }>;
    slotDocumentId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'documentId of the weekly timetable slot.';
          label: 'Weekly Slot (id)';
        };
      }>;
    startTime: Schema.Attribute.Time &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "Copied from the slot when booked (so later timetable edits don't rewrite history).";
          label: 'Start Time';
        };
      }>;
    status: Schema.Attribute.Enumeration<
      ['pending', 'confirmed', 'cancelled', 'attended', 'no-show']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'pending = waiting for payment (seat held for a few minutes), confirmed = paid/free and booked.';
          label: 'Status';
        };
      }> &
      Schema.Attribute.DefaultTo<'pending'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Who booked.';
          label: 'Member';
        };
      }>;
  };
}

export interface ApiClassClass extends Struct.CollectionTypeSchema {
  collectionName: 'classes';
  info: {
    description: 'A training class (e.g. Muay Thai, CrossFit, Yoga). Each class has a thumbnail, description, intensity level, and links to schedule slots.';
    displayName: 'Class';
    pluralName: 'classes';
    singularName: 'class';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    coaches: Schema.Attribute.Relation<'manyToMany', 'api::coach.coach'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Coaches who lead this class (shown in the Program section). Leave empty if not decided yet.';
          label: 'Coaches';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Detailed description with rich text formatting.';
          label: 'Description';
        };
      }>;
    discipline: Schema.Attribute.Relation<
      'manyToOne',
      'api::discipline.discipline'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The martial art or training style this class belongs to.';
          label: 'Discipline';
        };
      }>;
    durationMinutes: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Length of one session.';
          label: 'Duration (minutes)';
        };
      }>;
    equipment: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Equipment used in the class, e.g. "Barbells", "Kettlebells". One per line.';
          label: 'Equipment Used (one per line)';
        };
      }>;
    featuredVideo: Schema.Attribute.Media<'videos'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full video shown on the class page. Visitors press play themselves (sound on).';
          label: 'Class Video';
        };
      }>;
    frequency: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Shown on the class page, e.g. "3 days per week".';
          label: 'Frequency';
        };
      }>;
    gallery: Schema.Attribute.Media<'images' | 'videos', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Photos and clips for this class. Shown as a clickable gallery on the class page (opens in a lightbox). Add as many as you like; order = display order.';
          label: 'Gallery (photos & videos)';
        };
      }>;
    intensity: Schema.Attribute.Enumeration<
      ['low', 'medium', 'high', 'extreme']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'How physically demanding this class is: Low, Medium, High, or Extreme.';
          label: 'Intensity Level';
        };
      }> &
      Schema.Attribute.DefaultTo<'medium'>;
    isFree: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Tick if this class is free and does not require a membership or pass.';
          label: 'Free Class?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    level: Schema.Attribute.Enumeration<
      ['beginner', 'intermediate', 'advanced', 'all']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Who this class suits: Beginner, Intermediate, Advanced, or All levels.';
          label: 'Experience Level';
        };
      }> &
      Schema.Attribute.DefaultTo<'all'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::class.class'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Class name shown on cards and pages. Max 20 characters.';
          label: 'Class Name';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
    previewVideo: Schema.Attribute.Media<'videos'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short muted loop (5-10s, under 3 MB, MP4/WebM). Plays when someone hovers the class card.';
          label: 'Card Hover Video';
        };
      }>;
    price: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'What one person pays to book ONE session of this class. Use 0 for a free class.';
          label: 'Price per Session (LKR)';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    publishedAt: Schema.Attribute.DateTime;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    tagline: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short line under the name, e.g. "Strength Training". Max 50 characters.';
          label: 'Class Type (short label)';
        };
      }> &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    targetAreas: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Body areas / skills this class develops, e.g. "Legs", "Core", "Cardio endurance". One per line.';
          label: 'Target Areas (one per line)';
        };
      }>;
    thumbnail: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main image shown on the class card and as the video poster. Use a tall/portrait or square photo (min 1200px).';
          label: 'Card Image';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    whatToExpect: Schema.Attribute.Blocks;
  };
}

export interface ApiCoachCoach extends Struct.CollectionTypeSchema {
  collectionName: 'coaches';
  info: {
    description: 'A coach profile. Includes photo, bio, specialities, disciplines, and social links.';
    displayName: 'Coach';
    pluralName: 'coaches';
    singularName: 'coach';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bio: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full biography with rich text formatting.';
          label: 'Full Biography';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    disciplines: Schema.Attribute.Relation<
      'manyToMany',
      'api::discipline.discipline'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Martial arts or training styles taught by this coach.';
          label: 'Disciplines';
        };
      }>;
    instagram: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Instagram handle without the @ symbol.';
          label: 'Instagram Username';
        };
      }>;
    isHeadCoach: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Mark as Head Coach to feature this person prominently on the Coaches page.';
          label: 'Head Coach?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::coach.coach'> &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    nickname: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional, e.g. "The Wolverine". Shown next to the name.';
          label: 'Ring Name / Nickname';
        };
      }>;
    photo: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Portrait or profile photo.';
          label: 'Photo';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Job title shown on the coach card, e.g. "Head Boxing Coach".';
          label: 'Role / Title';
        };
      }>;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    shortBio: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Brief bio for card previews \u2014 1 to 2 sentences.';
          label: 'Short Bio';
        };
      }>;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    specialties: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Key skills, techniques, or certifications. Type each on its own line \u2014 shown as tag badges on the profile.';
          label: 'Specialties (one per line)';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    yearsExperience: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Total years of coaching or competition experience.';
          label: 'Years of Experience';
        };
      }>;
  };
}

export interface ApiDisciplineDiscipline extends Struct.CollectionTypeSchema {
  collectionName: 'disciplines';
  info: {
    description: 'A training discipline (e.g. Boxing, HIIT) used to categorise classes and coaches.';
    displayName: 'Discipline';
    pluralName: 'disciplines';
    singularName: 'discipline';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    colour: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Colour used to style this card: Yellow, Blue, Red, or White.';
          label: 'Accent Colour';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    icon: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Small decorative icon image.';
          label: 'Icon';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::discipline.discipline'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiEmailLogEmailLog extends Struct.CollectionTypeSchema {
  collectionName: 'email_logs';
  info: {
    description: 'Every email the system sends (or would send). While no email provider is connected, emails are recorded here.';
    displayName: 'Email Log';
    pluralName: 'email-logs';
    singularName: 'email-log';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    body: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    error: Schema.Attribute.Text;
    html: Schema.Attribute.Text;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::email-log.email-log'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sentAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<['logged', 'sent', 'failed']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'logged'>;
    subject: Schema.Attribute.String & Schema.Attribute.Required;
    to: Schema.Attribute.String & Schema.Attribute.Required;
    type: Schema.Attribute.Enumeration<
      [
        'booking-confirmation',
        'booking-reminder',
        'booking-cancelled',
        'welcome',
        'password-reset',
        'other',
      ]
    > &
      Schema.Attribute.DefaultTo<'other'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFaqCategoryFaqCategory extends Struct.CollectionTypeSchema {
  collectionName: 'faq_categories';
  info: {
    description: 'Groups FAQs on the FAQ page (e.g. Membership, Classes, Facilities).';
    displayName: 'FAQ Category';
    pluralName: 'faq-categories';
    singularName: 'faq-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::faq-category.faq-category'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFaqFaq extends Struct.CollectionTypeSchema {
  collectionName: 'faqs';
  info: {
    description: 'A frequently asked question with rich-text answer. Assign to a category for grouping.';
    displayName: 'FAQ';
    pluralName: 'faqs';
    singularName: 'faq';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    answer: Schema.Attribute.Blocks &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full answer with rich text formatting. You can add bullet lists, bold text, and links.';
          label: 'Answer';
        };
      }>;
    category: Schema.Attribute.Relation<
      'manyToOne',
      'api::faq-category.faq-category'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Groups this question with related FAQs on the FAQ page.';
          label: 'FAQ Category';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isFeatured: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Featured items appear in homepage sections and spotlights.';
          label: 'Featured?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::faq.faq'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The frequently asked question, written as the visitor would phrase it.';
          label: 'Question';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiFooterFooter extends Struct.SingleTypeSchema {
  collectionName: 'footers';
  info: {
    description: 'Footer content: navigation columns, newsletter signup, legal links, copyright text, and wordmark.';
    displayName: 'Footer';
    pluralName: 'footers';
    singularName: 'footer';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    columns: Schema.Attribute.Component<'navigation.footer-column', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Groups of links in the footer. Drag to reorder.';
          label: 'Footer Link Columns';
        };
      }>;
    copyrightText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Copyright notice in the bottom bar. Use {year} as a placeholder for the current year, e.g. "\u00A9 {year} The Wolverine Hub".';
          label: 'Copyright Line';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ctaBlock: Schema.Attribute.Component<'sections.cta-banner', false>;
    legalLinks: Schema.Attribute.Component<'shared.link', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Links shown in the footer bottom bar \u2014 Privacy Policy, Terms, etc.';
          label: 'Legal Links';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::footer.footer'
    > &
      Schema.Attribute.Private;
    newsletterEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Display the email sign-up form in the footer.';
          label: 'Show Newsletter Sign-up?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    newsletterHeading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Heading above the newsletter form (e.g. "Stay in the Loop").';
          label: 'Newsletter Heading';
        };
      }>;
    newsletterSubheading: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short description below the newsletter heading.';
          label: 'Newsletter Subheading';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    wordmarkText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Large brand text shown as a background watermark in the footer.';
          label: 'Footer Wordmark';
        };
      }> &
      Schema.Attribute.DefaultTo<'THE WOLVERINE HUB'>;
  };
}

export interface ApiFormForm extends Struct.CollectionTypeSchema {
  collectionName: 'forms';
  info: {
    description: 'A form definition for contact and lead-capture forms. Configure fields and destination here.';
    displayName: 'Form';
    pluralName: 'forms';
    singularName: 'form';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    consentText: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    errorMessage: Schema.Attribute.Text;
    fields: Schema.Attribute.JSON;
    formKey: Schema.Attribute.UID & Schema.Attribute.Required;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::form.form'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    recipientEmails: Schema.Attribute.JSON;
    successMessage: Schema.Attribute.Text;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGalleryItemGalleryItem extends Struct.CollectionTypeSchema {
  collectionName: 'gallery_items';
  info: {
    description: 'A photo or video for the gallery. Add a caption and category for filtering.';
    displayName: 'Gallery Item';
    pluralName: 'gallery-items';
    singularName: 'gallery-item';
  };
  options: {
    draftAndPublish: true;
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
    category: Schema.Attribute.Enumeration<
      [
        'training',
        'facility',
        'coaches',
        'community',
        'recovery',
        'food',
        'event',
      ]
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Groups this question with related FAQs on the FAQ page.';
          label: 'FAQ Category';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isFeatured: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Featured items appear in homepage sections and spotlights.';
          label: 'Featured?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::gallery-item.gallery-item'
    > &
      Schema.Attribute.Private;
    media: Schema.Attribute.Media<'images' | 'videos'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Image or video file.';
          label: 'Media Asset';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiGlobalGlobal extends Struct.SingleTypeSchema {
  collectionName: 'globals';
  info: {
    description: 'Site-wide settings: logo, contact details, social links, SEO defaults, and experience feature flags.';
    displayName: 'Global';
    pluralName: 'globals';
    singularName: 'global';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    address: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full postal address shown on the Contact page.';
          label: 'Physical Address';
        };
      }>;
    companyNumber: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Used in legal footer notices.';
          label: 'Company Registration Number';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    defaultSeo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Fallback SEO used when a page has no specific SEO fields set.';
          label: 'Default SEO Settings';
        };
      }>;
    email: Schema.Attribute.Email &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main contact email address displayed on the site.';
          label: 'Contact Email';
        };
      }>;
    experienceCustomCursor: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Show a custom cursor on desktop (auto-disabled on touch devices).';
          label: 'Enable Custom Cursor';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    experienceIntroAnimation: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Show the full-screen cinematic intro on first visit.';
          label: 'Enable Intro Animation';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    experienceMotionIntensity: Schema.Attribute.Enumeration<
      ['full', 'lite', 'minimal']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full = all animations active. Lite = reduced animations. Minimal = static layout only.';
          label: 'Motion Intensity';
        };
      }> &
      Schema.Attribute.DefaultTo<'full'>;
    experienceSmoothScroll: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Enable GSAP ScrollSmoother on desktop browsers.';
          label: 'Enable Smooth Scroll';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    experienceSoundDefault: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Play ambient sound automatically on load. Not recommended \u2014 leave off unless specifically needed.';
          label: 'Sound On by Default';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    experienceWebgl: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Enable 3D / shader effects in the hero section. Disabling improves performance on low-end devices.';
          label: 'Enable WebGL Effects';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    facebook: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full Facebook page URL.';
          label: 'Facebook Page URL';
        };
      }>;
    favicon: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Browser tab icon. Recommended: 32 \u00D7 32 px ICO or PNG.';
          label: 'Favicon';
        };
      }>;
    hoursJson: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Opening hours as a JSON object, e.g. {"Monday": "6am\u20139pm", "Tuesday": "6am\u20139pm"}.';
          label: 'Opening Hours (JSON)';
        };
      }>;
    instagram: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Instagram handle without the @ symbol.';
          label: 'Instagram Username';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::global.global'
    > &
      Schema.Attribute.Private;
    logoDark: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full logo for use on light backgrounds (transparent PNG or SVG).';
          label: 'Logo \u2013 Dark Version';
        };
      }>;
    logoLight: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full logo for use on dark backgrounds (transparent PNG or SVG).';
          label: 'Logo \u2013 Light Version';
        };
      }>;
    logoMonogram: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Small square icon version of the logo used in the mobile header and favicons.';
          label: 'Logo \u2013 Monogram / Icon';
        };
      }>;
    mapLink: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Link to the location on Google Maps.';
          label: 'Google Maps URL';
        };
      }>;
    phone: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Contact phone number including country code, e.g. +94 77 123 4567.';
          label: 'Phone Number';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    siteName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Official site name shown in browser tabs and SEO (e.g. "The Wolverine Hub").';
          label: 'Site Name';
        };
      }> &
      Schema.Attribute.DefaultTo<'The Wolverine Hub'>;
    siteTagline: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short tagline shown under the logo in some layouts.';
          label: 'Brand Tagline';
        };
      }>;
    tiktok: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'TikTok handle without the @ symbol.';
          label: 'TikTok Username';
        };
      }>;
    twitterHandle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Twitter/X username without the @ symbol.';
          label: 'Twitter / X Handle';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    whatsapp: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'WhatsApp number including country code with no spaces, e.g. +94771234567.';
          label: 'WhatsApp Number';
        };
      }>;
    youtube: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full YouTube channel URL.';
          label: 'YouTube Channel URL';
        };
      }>;
  };
}

export interface ApiHeaderHeader extends Struct.SingleTypeSchema {
  collectionName: 'headers';
  info: {
    description: 'Navigation menu links, announcement bar, and top-bar call-to-action button.';
    displayName: 'Header';
    pluralName: 'headers';
    singularName: 'header';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    announcementBarColour: Schema.Attribute.Enumeration<
      ['yellow', 'red', 'blue']
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Background colour of the announcement bar.';
          label: 'Announcement Bar Colour';
        };
      }> &
      Schema.Attribute.DefaultTo<'yellow'>;
    announcementBarEnabled: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Display the strip banner above the header.';
          label: 'Show Announcement Bar?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    announcementBarLink: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Optional destination URL. Leave blank for no link.';
          label: 'Announcement Link URL';
        };
      }>;
    announcementBarText: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Message shown in the announcement bar (keep short \u2014 one line).';
          label: 'Announcement Text';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::header.header'
    > &
      Schema.Attribute.Private;
    menuItems: Schema.Attribute.Component<'navigation.menu-item', true> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'All links shown in the main navigation. Drag to reorder.';
          label: 'Navigation Menu Items';
        };
      }>;
    primaryCta: Schema.Attribute.Component<'shared.cta-button', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main call-to-action button. Leave empty to hide it.';
          label: 'Primary Action Button';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLeadLead extends Struct.CollectionTypeSchema {
  collectionName: 'leads';
  info: {
    description: 'An enquiry or lead captured from a site contact form.';
    displayName: 'Lead';
    pluralName: 'leads';
    singularName: 'lead';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main contact email address displayed on the site.';
          label: 'Contact Email';
        };
      }>;
    fields: Schema.Attribute.JSON;
    formKey: Schema.Attribute.String & Schema.Attribute.Required;
    ipHash: Schema.Attribute.String;
    leadStatus: Schema.Attribute.Enumeration<
      ['new', 'contacted', 'converted', 'closed']
    > &
      Schema.Attribute.DefaultTo<'new'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::lead.lead'> &
      Schema.Attribute.Private;
    message: Schema.Attribute.Text;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    phone: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Contact phone number including country code, e.g. +94 77 123 4567.';
          label: 'Phone Number';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiLegalPageLegalPage extends Struct.CollectionTypeSchema {
  collectionName: 'legal_pages';
  info: {
    description: 'Legal documents \u2014 Privacy Policy, Terms of Service, etc. Each has a title, slug, and rich-text content body.';
    displayName: 'Legal Page';
    pluralName: 'legal-pages';
    singularName: 'legal-page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    content: Schema.Attribute.Blocks &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main body of this entry \u2014 supports rich text, images, and embeds.';
          label: 'Body Content';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    lastUpdated: Schema.Attribute.Date;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::legal-page.legal-page'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    slug: Schema.Attribute.UID<'title'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The display title shown on the page and in browser tabs.';
          label: 'Title';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiNewsletterSubscriberNewsletterSubscriber
  extends Struct.CollectionTypeSchema {
  collectionName: 'newsletter_subscribers';
  info: {
    description: 'An email address subscribed via the newsletter block.';
    displayName: 'Newsletter Subscriber';
    pluralName: 'newsletter-subscribers';
    singularName: 'newsletter-subscriber';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmedAt: Schema.Attribute.DateTime;
    confirmToken: Schema.Attribute.String;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main contact email address displayed on the site.';
          label: 'Contact Email';
        };
      }>;
    ipHash: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::newsletter-subscriber.newsletter-subscriber'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    source: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPagePage extends Struct.CollectionTypeSchema {
  collectionName: 'pages';
  info: {
    description: "All site pages \u2014 Home, Classes, Coaches, Schedule, Programs, Pricing, Gallery, Contact, etc. Add sections to build each page's layout. The slug field is the URL path (e.g. 'home', 'classes', 'contact').";
    displayName: 'Page';
    pluralName: 'pages';
    singularName: 'page';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::page.page'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    sections: Schema.Attribute.DynamicZone<
      [
        'sections.page-hero',
        'sections.hero-video',
        'sections.stat-counters',
        'sections.marquee',
        'sections.class-rail',
        'sections.scroll-chapter',
        'sections.feature-split',
        'sections.triptych',
        'sections.program-tiers',
        'sections.coach-spotlight',
        'sections.coach-carousel',
        'sections.pricing-teaser',
        'sections.app-features',
        'sections.gallery-grid',
        'sections.testimonial-slider',
        'sections.partner-strip',
        'sections.faq-block',
        'sections.location-block',
        'sections.cta-banner',
        'sections.newsletter-block',
        'sections.rich-text',
        'sections.video-feature',
        'sections.our-story',
      ]
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Build the page layout by adding and reordering sections. Each section type creates a different visual block.';
          label: 'Page Sections';
        };
      }>;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    slug: Schema.Attribute.UID<'title'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The display title shown on the page and in browser tabs.';
          label: 'Title';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPartnerPartner extends Struct.CollectionTypeSchema {
  collectionName: 'partners';
  info: {
    description: 'A brand partner or sponsor shown in the Partner Strip section.';
    displayName: 'Partner';
    pluralName: 'partners';
    singularName: 'partner';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::partner.partner'
    > &
      Schema.Attribute.Private;
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full URL including https://';
          label: 'Website URL';
        };
      }>;
  };
}

export interface ApiPassPass extends Struct.CollectionTypeSchema {
  collectionName: 'passes';
  info: {
    description: 'A class pass product \u2014 number of sessions, validity period, and price.';
    displayName: 'Pass';
    pluralName: 'passes';
    singularName: 'pass';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    duration: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Human-readable duration shown to customers, e.g. "1 Month" or "3 Months".';
          label: 'Duration Label';
        };
      }>;
    durationDays: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Exact number of days \u2014 used to calculate pass expiry.';
          label: 'Duration in Days';
        };
      }>;
    isPurchasable: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'If unticked, this pass is hidden from the pricing page.';
          label: 'Available for Purchase?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::pass.pass'> &
      Schema.Attribute.Private;
    payHereItemName: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short item name sent to the PayHere payment gateway. No special characters.';
          label: 'PayHere Item Name';
        };
      }>;
    priceLKR: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Price in Sri Lankan Rupees. Do not include commas or currency symbols.';
          label: 'Price (LKR)';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    tier: Schema.Attribute.Relation<
      'manyToOne',
      'api::pricing-tier.pricing-tier'
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The membership tier this pass belongs to.';
          label: 'Pricing Tier';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPaymentPayment extends Struct.CollectionTypeSchema {
  collectionName: 'payments';
  info: {
    description: 'A payment attempt for a booking.';
    displayName: 'Payment';
    pluralName: 'payments';
    singularName: 'payment';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    amount: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Amount (LKR)';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    booking: Schema.Attribute.Relation<'manyToOne', 'api::booking.booking'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Booking';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'LKR'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::payment.payment'
    > &
      Schema.Attribute.Private;
    orderId: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Unique payment reference sent to the payment provider.';
          label: 'Order ID';
        };
      }>;
    paidAt: Schema.Attribute.DateTime &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Paid At';
        };
      }>;
    provider: Schema.Attribute.Enumeration<['preview', 'payhere', 'free']> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'preview = built-in test checkout; payhere = real gateway; free = no charge.';
          label: 'Provider';
        };
      }> &
      Schema.Attribute.DefaultTo<'preview'>;
    providerReference: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Gateway transaction id (when available).';
          label: 'Provider Reference';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    rawPayload: Schema.Attribute.JSON &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'For debugging.';
          label: 'Raw Provider Data';
        };
      }>;
    status: Schema.Attribute.Enumeration<
      ['pending', 'paid', 'failed', 'cancelled', 'refunded']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Status';
        };
      }> &
      Schema.Attribute.DefaultTo<'pending'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    user: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: '';
          label: 'Member';
        };
      }>;
  };
}

export interface ApiPostCategoryPostCategory
  extends Struct.CollectionTypeSchema {
  collectionName: 'post_categories';
  info: {
    description: 'A category for grouping blog/journal articles.';
    displayName: 'Post Category';
    pluralName: 'post-categories';
    singularName: 'post-category';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::post-category.post-category'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPostPost extends Struct.CollectionTypeSchema {
  collectionName: 'posts';
  info: {
    description: 'A journal/blog article with rich-text content, cover image, author, and category.';
    displayName: 'Post';
    pluralName: 'posts';
    singularName: 'post';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    author: Schema.Attribute.Relation<'manyToOne', 'api::author.author'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The person who wrote this post.';
          label: 'Author';
        };
      }>;
    category: Schema.Attribute.Relation<
      'manyToOne',
      'api::post-category.post-category'
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Groups this question with related FAQs on the FAQ page.';
          label: 'FAQ Category';
        };
      }>;
    content: Schema.Attribute.Blocks &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main body of this entry \u2014 supports rich text, images, and embeds.';
          label: 'Body Content';
        };
      }>;
    coverImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full-width feature image shown at the top of the page or post.';
          label: 'Cover Image';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    isFeatured: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Featured items appear in homepage sections and spotlights.';
          label: 'Featured?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::post.post'> &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    readingTimeMinutes: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Estimated reading time. Leave blank to auto-calculate from word count.';
          label: 'Reading Time (minutes)';
        };
      }>;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    slug: Schema.Attribute.UID<'title'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    summary: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short summary shown in listings and search results (1\u20132 sentences, plain text).';
          label: 'Summary';
        };
      }>;
    tags: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Keywords for search and filtering. Type each tag on its own line \u2014 e.g. boxing, technique, beginner.';
          label: 'Tags (one per line)';
        };
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The display title shown on the page and in browser tabs.';
          label: 'Title';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiPricingTierPricingTier extends Struct.CollectionTypeSchema {
  collectionName: 'pricing_tiers';
  info: {
    description: 'A pricing plan shown on the Pricing page. Contains name, tagline, feature list, and colour.';
    displayName: 'Pricing Tier';
    pluralName: 'pricing-tiers';
    singularName: 'pricing-tier';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    colour: Schema.Attribute.Enumeration<['yellow', 'blue', 'red', 'white']> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Colour used to style this card: Yellow, Blue, Red, or White.';
          label: 'Accent Colour';
        };
      }> &
      Schema.Attribute.DefaultTo<'yellow'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Detailed description with rich text formatting.';
          label: 'Description';
        };
      }>;
    features: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "What's included in this plan. Type each bullet point on its own line \u2014 no punctuation needed.";
          label: 'Features (one per line)';
        };
      }>;
    isMostPopular: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Adds a "Most Popular" badge to highlight this tier.';
          label: 'Most Popular?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::pricing-tier.pricing-tier'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    tagline: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short punchy line shown beneath the title (one sentence max).';
          label: 'Tagline';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiProgramProgram extends Struct.CollectionTypeSchema {
  collectionName: 'programs';
  info: {
    description: 'A training program tier (e.g. Starter, Signature, Transformation). Contains pricing, description, and key features.';
    displayName: 'Program';
    pluralName: 'programs';
    singularName: 'program';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    currency: Schema.Attribute.String & Schema.Attribute.DefaultTo<'LKR'>;
    description: Schema.Attribute.Blocks &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Detailed description with rich text formatting.';
          label: 'Description';
        };
      }>;
    fromPrice: Schema.Attribute.Decimal;
    heroImage: Schema.Attribute.Media<'images'>;
    isFeatured: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Featured items appear in homepage sections and spotlights.';
          label: 'Featured?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    isLimitedAvailability: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::program.program'
    > &
      Schema.Attribute.Private;
    minimumCommitment: Schema.Attribute.String;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full display name.';
          label: 'Name';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    questionnaireFields: Schema.Attribute.JSON;
    requiresQuestionnaire: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    seo: Schema.Attribute.Component<'shared.seo', false> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Search engine optimisation settings for this page.';
          label: 'SEO Settings';
        };
      }>;
    shortDescription: Schema.Attribute.Text;
    slug: Schema.Attribute.UID<'name'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'URL path segment, auto-generated from the title. E.g. "our-classes" \u2192 /our-classes.';
          label: 'URL Slug';
        };
      }>;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    tagline: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short punchy line shown beneath the title (one sentence max).';
          label: 'Tagline';
        };
      }>;
    thumbnail: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Small preview image used in grids, cards, and listings.';
          label: 'Thumbnail';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiRedirectRedirect extends Struct.CollectionTypeSchema {
  collectionName: 'redirects';
  info: {
    description: 'A URL redirect rule. Use permanent (301) for SEO-safe redirects.';
    displayName: 'Redirect';
    pluralName: 'redirects';
    singularName: 'redirect';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    from: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The old URL path to redirect away from, e.g. /old-page.';
          label: 'Old URL (redirect from)';
        };
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Only active slots are shown on the public schedule page.';
          label: 'Active on Schedule?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::redirect.redirect'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    statusCode: Schema.Attribute.Enumeration<['permanent', 'temporary']> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Permanent (301) = moved forever. Temporary (302) = short-term redirect.';
          label: 'Redirect Type';
        };
      }> &
      Schema.Attribute.DefaultTo<'permanent'>;
    to: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The destination URL, e.g. /new-page or a full https:// URL.';
          label: 'New URL (redirect to)';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiScheduleSlotScheduleSlot
  extends Struct.CollectionTypeSchema {
  collectionName: 'schedule_slots';
  info: {
    description: 'A recurring class slot on the weekly timetable \u2014 weekday, start/end time, class, coach, and capacity.';
    displayName: 'Schedule Slot';
    pluralName: 'schedule-slots';
    singularName: 'schedule-slot';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    capacity: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Maximum number of participants allowed per session.';
          label: 'Maximum Capacity';
        };
      }> &
      Schema.Attribute.DefaultTo<20>;
    class: Schema.Attribute.Relation<'manyToOne', 'api::class.class'> &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Which class is scheduled in this time slot.';
          label: 'Class';
        };
      }>;
    coach: Schema.Attribute.Relation<'manyToOne', 'api::coach.coach'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Coach leading this session (optional).';
          label: 'Coach';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    endTime: Schema.Attribute.Time &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Time the class ends in 24-hour format, e.g. 07:00.';
          label: 'End Time';
        };
      }>;
    isActive: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Only active slots are shown on the public schedule page.';
          label: 'Active on Schedule?';
        };
      }> &
      Schema.Attribute.DefaultTo<true>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::schedule-slot.schedule-slot'
    > &
      Schema.Attribute.Private;
    notes: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Private notes for the team \u2014 not shown on the public website.';
          label: 'Internal Notes';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    room: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Which part of the gym this runs in, e.g. "Main Floor" or "Boxing Ring".';
          label: 'Room / Area';
        };
      }>;
    startTime: Schema.Attribute.Time &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Time the class begins in 24-hour format, e.g. 06:00.';
          label: 'Start Time';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    weekday: Schema.Attribute.Enumeration<
      [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Which day this slot runs every week.';
          label: 'Day of Week';
        };
      }>;
  };
}

export interface ApiStatStat extends Struct.CollectionTypeSchema {
  collectionName: 'stats';
  info: {
    description: "A key statistic for the Stat Counters section (e.g. '24 disciplines', '5 coaches').";
    displayName: 'Stat';
    pluralName: 'stats';
    singularName: 'stat';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short descriptor shown beneath the number, e.g. "Disciplines", "Expert Coaches", "Members trained".';
          label: 'Stat Label';
        };
      }>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<'oneToMany', 'api::stat.stat'> &
      Schema.Attribute.Private;
    prefix: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text before the number, e.g. "Over" or "~".';
          label: 'Prefix';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    suffix: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text after the number, e.g. "+" or "classes".';
          label: 'Suffix';
        };
      }>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    value: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'The number or text shown in large format, e.g. "24" or "500+".';
          label: 'Stat Value';
        };
      }>;
  };
}

export interface ApiTestimonialTestimonial extends Struct.CollectionTypeSchema {
  collectionName: 'testimonials';
  info: {
    description: 'A member testimonial \u2014 quote, photo, name, and optional rating.';
    displayName: 'Testimonial';
    pluralName: 'testimonials';
    singularName: 'testimonial';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    authorName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Full name of the person giving the testimonial.';
          label: "Member's Name";
        };
      }>;
    authorTitle: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short context, e.g. "Boxing member since 2022" or "Lost 12 kg in 4 months".';
          label: 'Member Description';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    goal: Schema.Attribute.Enumeration<
      [
        'weight-loss',
        'strength',
        'martial-arts',
        'endurance',
        'flexibility',
        'general-fitness',
        'competition',
      ]
    > &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "Member's primary training goal, e.g. Weight Loss, Competition Prep.";
          label: 'Training Goal';
        };
      }>;
    isFeatured: Schema.Attribute.Boolean &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Featured items appear in homepage sections and spotlights.';
          label: 'Featured?';
        };
      }> &
      Schema.Attribute.DefaultTo<false>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::testimonial.testimonial'
    > &
      Schema.Attribute.Private;
    photo: Schema.Attribute.Media<'images'> &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Portrait or profile photo.';
          label: 'Photo';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    quote: Schema.Attribute.Text &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: "The member's own words. No need to add quote marks \u2014 they're added automatically.";
          label: 'Testimonial Quote';
        };
      }>;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Rating out of 5.';
          label: 'Star Rating';
        };
      }> &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface ApiTokenPackTokenPack extends Struct.CollectionTypeSchema {
  collectionName: 'token_packs';
  info: {
    description: 'A token bundle product that members purchase to book individual classes.';
    displayName: 'Token Pack';
    pluralName: 'token-packs';
    singularName: 'token-pack';
  };
  options: {
    draftAndPublish: true;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::token-pack.token-pack'
    > &
      Schema.Attribute.Private;
    payHereItemName: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Short item name sent to the PayHere payment gateway. No special characters.';
          label: 'PayHere Item Name';
        };
      }>;
    priceLKR: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Price in Sri Lankan Rupees. Do not include commas or currency symbols.';
          label: 'Price (LKR)';
        };
      }>;
    publishedAt: Schema.Attribute.DateTime;
    sortOrder: Schema.Attribute.Integer &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Lower numbers appear first in listings. Items with the same number are sorted alphabetically.';
          label: 'Sort Order';
        };
      }> &
      Schema.Attribute.DefaultTo<0>;
    tokens: Schema.Attribute.Integer & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    validityDays: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<15>;
  };
}

export interface ApiUiStringsUiStrings extends Struct.SingleTypeSchema {
  collectionName: 'ui_strings';
  info: {
    description: 'All text labels used across the site UI \u2014 button copy, error messages, accessibility labels. Edit here to update wording without a code deploy.';
    displayName: 'UI Strings';
    pluralName: 'ui-strings-settings';
    singularName: 'ui-strings';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bookNowLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text on booking buttons throughout the site.';
          label: '"Book Now" Button Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Book now'>;
    cookieNotice: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text shown in the cookie consent banner.';
          label: 'Cookie Notice Text';
        };
      }>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    errorBody: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Body text on the error page.';
          label: 'Error Page Body Text';
        };
      }>;
    errorHeading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main heading on the generic error page.';
          label: 'Error Page Heading';
        };
      }> &
      Schema.Attribute.DefaultTo<'Something snapped.'>;
    filterNoResults: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Message shown when a filter or search returns nothing.';
          label: '"No Results" Message';
        };
      }> &
      Schema.Attribute.DefaultTo<'No results found.'>;
    formErrorDefault: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Shown when a form submission fails.';
          label: 'Default Form Error Message';
        };
      }> &
      Schema.Attribute.DefaultTo<'Something went wrong. Please try again.'>;
    formSuccessDefault: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Shown after any form is submitted successfully.';
          label: 'Default Form Success Message';
        };
      }> &
      Schema.Attribute.DefaultTo<'Message received. We will be in touch.'>;
    fullBadge: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Badge shown on fully booked schedule slots.';
          label: '"Class Full" Badge Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Full'>;
    introSkipLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text on the button that skips the intro animation.';
          label: '"Skip Intro" Button Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Skip the ceremony.'>;
    loadMoreLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text on the pagination load-more button.';
          label: '"Load More" Button Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Load more'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'api::ui-strings.ui-strings'
    > &
      Schema.Attribute.Private;
    notFoundBody: Schema.Attribute.Text &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Body text on the 404 page.';
          label: '404 Page Body Text';
        };
      }>;
    notFoundHeading: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Main heading on the "Page Not Found" error page.';
          label: '404 Page Heading';
        };
      }> &
      Schema.Attribute.DefaultTo<'Rest Day.'>;
    publishedAt: Schema.Attribute.DateTime;
    searchPlaceholder: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Placeholder shown inside the search input field.';
          label: 'Search Placeholder Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Search classes, coaches, programs...'>;
    skipLinkLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Accessibility link at the top of every page (screen readers).';
          label: '"Skip to Content" Link Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'Skip to main content'>;
    spotsLeftTemplate: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Template text \u2014 use {n} as a placeholder, e.g. "{n} spots left".';
          label: '"Spots Left" Template';
        };
      }> &
      Schema.Attribute.DefaultTo<'{n} spots left'>;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    viewDetailsLabel: Schema.Attribute.String &
      Schema.Attribute.SetPluginOptions<{
        'content-manager': {
          description: 'Text on card detail link buttons.';
          label: '"View Details" Link Text';
        };
      }> &
      Schema.Attribute.DefaultTo<'View details'>;
  };
}

export interface PluginContentReleasesRelease
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    publishedAt: Schema.Attribute.DateTime;
    releasedAt: Schema.Attribute.DateTime;
    scheduledAt: Schema.Attribute.DateTime;
    status: Schema.Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Schema.Attribute.Required;
    timezone: Schema.Attribute.String;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    entryDocumentId: Schema.Attribute.String;
    isEntryValid: Schema.Attribute.Boolean;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::content-releases.release-action'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    release: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Schema.Attribute.Enumeration<['publish', 'unpublish']> &
      Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginI18NLocale extends Struct.CollectionTypeSchema {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Schema.Attribute.String & Schema.Attribute.Unique;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::i18n.locale'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflow
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows';
  info: {
    description: '';
    displayName: 'Workflow';
    name: 'Workflow';
    pluralName: 'workflows';
    singularName: 'workflow';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentTypes: Schema.Attribute.JSON &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'[]'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    stageRequiredToPublish: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::review-workflows.workflow-stage'
    >;
    stages: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginReviewWorkflowsWorkflowStage
  extends Struct.CollectionTypeSchema {
  collectionName: 'strapi_workflows_stages';
  info: {
    description: '';
    displayName: 'Stages';
    name: 'Workflow Stage';
    pluralName: 'workflow-stages';
    singularName: 'workflow-stage';
  };
  options: {
    draftAndPublish: false;
    version: '1.1.0';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#4945FF'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::review-workflows.workflow-stage'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String;
    permissions: Schema.Attribute.Relation<'manyToMany', 'admin::permission'>;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    workflow: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::review-workflows.workflow'
    >;
  };
}

export interface PluginUploadFile extends Struct.CollectionTypeSchema {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Schema.Attribute.Text;
    caption: Schema.Attribute.Text;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    ext: Schema.Attribute.String;
    focalPoint: Schema.Attribute.JSON;
    folder: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'> &
      Schema.Attribute.Private;
    folderPath: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    formats: Schema.Attribute.JSON;
    hash: Schema.Attribute.String & Schema.Attribute.Required;
    height: Schema.Attribute.Integer;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.file'
    > &
      Schema.Attribute.Private;
    mime: Schema.Attribute.String & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    previewUrl: Schema.Attribute.Text;
    provider: Schema.Attribute.String & Schema.Attribute.Required;
    provider_metadata: Schema.Attribute.JSON;
    publishedAt: Schema.Attribute.DateTime;
    related: Schema.Attribute.Relation<'morphToMany'>;
    size: Schema.Attribute.Decimal & Schema.Attribute.Required;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    url: Schema.Attribute.Text & Schema.Attribute.Required;
    width: Schema.Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Struct.CollectionTypeSchema {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.folder'>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    files: Schema.Attribute.Relation<'oneToMany', 'plugin::upload.file'>;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::upload.folder'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    parent: Schema.Attribute.Relation<'manyToOne', 'plugin::upload.folder'>;
    path: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    pathId: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.Unique;
    publishedAt: Schema.Attribute.DateTime;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Schema.Attribute.String & Schema.Attribute.Required;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    > &
      Schema.Attribute.Private;
    publishedAt: Schema.Attribute.DateTime;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    description: Schema.Attribute.String;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.role'
    > &
      Schema.Attribute.Private;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    publishedAt: Schema.Attribute.DateTime;
    type: Schema.Attribute.String & Schema.Attribute.Unique;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    users: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser
  extends Struct.CollectionTypeSchema {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    blocked: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    confirmationToken: Schema.Attribute.String & Schema.Attribute.Private;
    confirmed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    createdAt: Schema.Attribute.DateTime;
    createdBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    dateOfBirth: Schema.Attribute.Date;
    email: Schema.Attribute.Email &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    emergencyContactName: Schema.Attribute.String;
    emergencyContactPhone: Schema.Attribute.String;
    fitnessGoals: Schema.Attribute.Text;
    fullName: Schema.Attribute.String;
    gender: Schema.Attribute.Enumeration<
      ['female', 'male', 'other', 'prefer-not-to-say']
    >;
    locale: Schema.Attribute.String & Schema.Attribute.Private;
    localizations: Schema.Attribute.Relation<
      'oneToMany',
      'plugin::users-permissions.user'
    > &
      Schema.Attribute.Private;
    marketingOptIn: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    medicalNotes: Schema.Attribute.Text;
    password: Schema.Attribute.Password &
      Schema.Attribute.Private &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    phone: Schema.Attribute.String;
    provider: Schema.Attribute.String;
    publishedAt: Schema.Attribute.DateTime;
    resetPasswordToken: Schema.Attribute.String & Schema.Attribute.Private;
    role: Schema.Attribute.Relation<
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Schema.Attribute.DateTime;
    updatedBy: Schema.Attribute.Relation<'oneToOne', 'admin::user'> &
      Schema.Attribute.Private;
    username: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.Unique &
      Schema.Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ContentTypeSchemas {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::session': AdminSession;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::add-on.add-on': ApiAddOnAddOn;
      'api::amenity.amenity': ApiAmenityAmenity;
      'api::author.author': ApiAuthorAuthor;
      'api::booking.booking': ApiBookingBooking;
      'api::class.class': ApiClassClass;
      'api::coach.coach': ApiCoachCoach;
      'api::discipline.discipline': ApiDisciplineDiscipline;
      'api::email-log.email-log': ApiEmailLogEmailLog;
      'api::faq-category.faq-category': ApiFaqCategoryFaqCategory;
      'api::faq.faq': ApiFaqFaq;
      'api::footer.footer': ApiFooterFooter;
      'api::form.form': ApiFormForm;
      'api::gallery-item.gallery-item': ApiGalleryItemGalleryItem;
      'api::global.global': ApiGlobalGlobal;
      'api::header.header': ApiHeaderHeader;
      'api::lead.lead': ApiLeadLead;
      'api::legal-page.legal-page': ApiLegalPageLegalPage;
      'api::newsletter-subscriber.newsletter-subscriber': ApiNewsletterSubscriberNewsletterSubscriber;
      'api::page.page': ApiPagePage;
      'api::partner.partner': ApiPartnerPartner;
      'api::pass.pass': ApiPassPass;
      'api::payment.payment': ApiPaymentPayment;
      'api::post-category.post-category': ApiPostCategoryPostCategory;
      'api::post.post': ApiPostPost;
      'api::pricing-tier.pricing-tier': ApiPricingTierPricingTier;
      'api::program.program': ApiProgramProgram;
      'api::redirect.redirect': ApiRedirectRedirect;
      'api::schedule-slot.schedule-slot': ApiScheduleSlotScheduleSlot;
      'api::stat.stat': ApiStatStat;
      'api::testimonial.testimonial': ApiTestimonialTestimonial;
      'api::token-pack.token-pack': ApiTokenPackTokenPack;
      'api::ui-strings.ui-strings': ApiUiStringsUiStrings;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::review-workflows.workflow': PluginReviewWorkflowsWorkflow;
      'plugin::review-workflows.workflow-stage': PluginReviewWorkflowsWorkflowStage;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
