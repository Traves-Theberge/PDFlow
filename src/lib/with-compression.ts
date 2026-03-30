import { NextRequest, NextResponse } from 'next/server';
import { gzipSync } from 'zlib';

/**
 * Content types that are already compressed and should skip gzip.
 */
const SKIP_CONTENT_TYPES = [
  'image/',
  'audio/',
  'video/',
  'application/zip',
  'application/gzip',
  'application/x-gzip',
  'application/pdf',
  'application/octet-stream',
  'application/x-bzip2',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
];

const MIN_COMPRESSION_SIZE = 1024; // 1KB

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (...args: any[]) => Promise<NextResponse | Response> | NextResponse | Response;

function shouldSkipCompression(contentType: string | null): boolean {
  if (!contentType) return false;
  return SKIP_CONTENT_TYPES.some((type) => contentType.startsWith(type));
}

function clientAcceptsGzip(request: NextRequest): boolean {
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  return acceptEncoding.includes('gzip');
}

/**
 * Wraps a Next.js API route handler to add gzip compression for responses over 1KB.
 * Skips compression for already-compressed content types (images, archives, etc.).
 */
export function withCompression(handler: RouteHandler): RouteHandler {
  return async (...args: unknown[]) => {
    const request = args[0] as NextRequest;
    const response = await handler(...args);

    if (!clientAcceptsGzip(request)) {
      return response;
    }

    const contentType = response.headers.get('content-type');
    if (shouldSkipCompression(contentType)) {
      return response;
    }

    // Already compressed
    if (response.headers.get('content-encoding')) {
      return response;
    }

    const body = await response.arrayBuffer();

    if (body.byteLength < MIN_COMPRESSION_SIZE) {
      return new NextResponse(body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
    }

    const compressed = gzipSync(Buffer.from(body));

    const headers = new Headers(response.headers);
    headers.set('content-encoding', 'gzip');
    headers.set('content-length', String(compressed.byteLength));
    headers.delete('transfer-encoding');

    return new NextResponse(compressed, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}
