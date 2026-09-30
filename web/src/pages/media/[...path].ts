import type { APIRoute } from 'astro';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { Readable } from 'stream';

const s3 = new S3Client({
  region: import.meta.env.BUCKET_REGION || 'auto',
  endpoint: import.meta.env.BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: import.meta.env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.BUCKET_SECRET_ACCESS_KEY,
  },
  forcePathStyle: import.meta.env.BUCKET_FORCE_PATH_STYLE === 'true',
});

const BUCKET = import.meta.env.BUCKET_NAME;

export const GET: APIRoute = async ({ params, request }) => {
  const key = params.path;
  if (!key) return new Response('Not found', { status: 404 });

  const rangeHeader = request.headers.get('range');

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ...(rangeHeader && { Range: rangeHeader }),
    });

    const s3res = await s3.send(command);
    const body = s3res.Body as Readable | ReadableStream | null;

    if (!body) return new Response('Not found', { status: 404 });

    const contentType = s3res.ContentType ?? 'application/octet-stream';
    const contentLength = s3res.ContentLength;
    const etag = s3res.ETag;
    const lastModified = s3res.LastModified?.toUTCString();

    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    if (contentLength) headers['Content-Length'] = String(contentLength);
    if (etag) headers['ETag'] = etag;
    if (lastModified) headers['Last-Modified'] = lastModified;

    // Range request support (206 Partial Content — required for video seeking)
    if (rangeHeader && s3res.ContentRange) {
      headers['Content-Range'] = s3res.ContentRange;
      headers['Accept-Ranges'] = 'bytes';

      // Convert Node.js Readable to Web ReadableStream if needed
      const stream = body instanceof ReadableStream
        ? body
        : new ReadableStream({
            start(controller) {
              (body as Readable).on('data', (chunk: Buffer) => controller.enqueue(chunk));
              (body as Readable).on('end', () => controller.close());
              (body as Readable).on('error', (err) => controller.error(err));
            },
          });

      return new Response(stream, { status: 206, headers });
    }

    const stream = body instanceof ReadableStream
      ? body
      : new ReadableStream({
          start(controller) {
            (body as Readable).on('data', (chunk: Buffer) => controller.enqueue(chunk));
            (body as Readable).on('end', () => controller.close());
            (body as Readable).on('error', (err) => controller.error(err));
          },
        });

    return new Response(stream, { status: 200, headers });
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code === 'NoSuchKey' || code === 'NotFound') {
      return new Response('Not found', { status: 404 });
    }
    return new Response('Internal server error', { status: 500 });
  }
};
