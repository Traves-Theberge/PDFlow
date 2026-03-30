import { NextResponse } from 'next/server';
import { withCompression } from '@/lib/with-compression';

/**
 * Health Check Endpoint
 *
 * Used by Docker health checks and monitoring systems
 * to verify the application is running correctly.
 *
 * @route GET /api/health
 * @returns {Object} Health status
 */
export const GET = withCompression(async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
});
