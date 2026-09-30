import type { Core } from '@strapi/strapi';

// Production overrides: disable Content-Type Builder so editors cannot
// accidentally modify schema in the live environment.
const config = (_ctx: Core.Config.Shared.ConfigParams): Partial<Core.Config.Plugin> => ({
  'content-type-builder': {
    enabled: false,
  },
});

export default config;
