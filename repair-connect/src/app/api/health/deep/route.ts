/**
 * Deep Health Check Endpoint
 * Checks database connectivity and other critical dependencies
 * Use this for startup probes or manual health verification
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks = {
    app: false,
    database: false,
    timestamp: new Date().toISOString(),
  };

  const errors: string[] = [];

  try {
    // Check 1: Application is running
    checks.app = true;

    // Check 2: Database connectivity
    try {
      const { db } = await connectToDatabase();
      await db.admin().ping();
      checks.database = true;
    } catch (dbError) {
      errors.push(
        `Database: ${dbError instanceof Error ? dbError.message : 'Connection failed'}`
      );
    }

    // Determine overall health
    const isHealthy = checks.app && checks.database;
    const status = isHealthy ? 'healthy' : 'degraded';

    return NextResponse.json(
      {
        status,
        checks,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: checks.timestamp,
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      { status: isHealthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        checks,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
