/**
 * Health Check Endpoint
 * Used by Kubernetes liveness and readiness probes
 * Returns 200 OK if the application is healthy
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/health
 * Basic health check - always returns 200 if app is running
 */
export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

/**
 * HEAD /api/health
 * Lightweight health check for Kubernetes probes
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}
