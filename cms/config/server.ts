import type { Core } from '@strapi/strapi';
import cronTasks from './cron-tasks';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // Public URL used by Strapi for media URLs, preview links and admin redirects.
  // Local: http://localhost:1337 | Live: https://cms-production-3644.up.railway.app
  url: env('STRAPI_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS')!,
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
  // Day-before booking reminders etc. — enabled on the live CMS only (see cron-tasks.ts).
  cron: {
    enabled: env.bool('ENABLE_CRON', false),
    tasks: cronTasks,
  },
});

export default config;
