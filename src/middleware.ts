import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware for API routes.
 *
 * Adds `Vary: Accept-Encoding` header for proper cache behavior.
 * Actual gzip compression is handled by the `withCompression` wrapper
 * in `src/lib/with-compression.ts` (Edge Runtime cannot use Node.js zlib,
 * and self-fetching in middleware causes infinite loops).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set('vary', 'Accept-Encoding');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
