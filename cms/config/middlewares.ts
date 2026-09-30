import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            env('BUCKET_ENDPOINT', 'http://localhost:9000'),
            env('PUBLIC_SITE_URL', 'http://localhost:4321'),
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            env('BUCKET_ENDPOINT', 'http://localhost:9000'),
            env('PUBLIC_SITE_URL', 'http://localhost:4321'),
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        env('PUBLIC_SITE_URL', 'http://localhost:4321'),
        // Allow local dev
        'http://localhost:4321',
        'http://localhost:1337',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
