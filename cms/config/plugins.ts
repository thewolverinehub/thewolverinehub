import type { Core } from '@strapi/strapi';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml', // sanitised on ingest via Strapi's SVG sanitiser
  'video/mp4',
  'video/webm',
  'application/pdf',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: { httpOnly: true },
    },
  },
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        // Strapi stores this as the base URL for all uploaded media URLs.
        // Points to the Astro media proxy (/media/...) so URLs never expose
        // the bucket directly.
        baseUrl: env('MEDIA_BASE_URL', `${env('BUCKET_ENDPOINT', 'http://localhost:9000')}/${env('BUCKET_NAME', 'wolverinehub-media')}`),
        s3Options: {
          credentials: {
            accessKeyId: env('BUCKET_ACCESS_KEY_ID'),
            secretAccessKey: env('BUCKET_SECRET_ACCESS_KEY'),
          },
          region: env('BUCKET_REGION', 'auto'),
          endpoint: env('BUCKET_ENDPOINT', 'http://localhost:9000'),
          forcePathStyle: env.bool('BUCKET_FORCE_PATH_STYLE', false),
          params: {
            Bucket: env('BUCKET_NAME', 'wolverinehub-media'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      security: {
        allowedTypes: ALLOWED_MIME_TYPES,
        maxSize: env.int('UPLOAD_MAX_SIZE_MB', 100) * 1024 * 1024,
      },
    },
  },
});

export default config;
