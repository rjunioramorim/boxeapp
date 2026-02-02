// app/api/health/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_req: NextRequest) {
    try {
        // Verificar se db foi criado
        if (!db) {
            return NextResponse.json(
                {
                    status: 'unhealthy',
                    timestamp: new Date().toISOString(),
                    database: {
                        status: 'disconnected',
                        error: 'DATABASE_URL não configurada',
                    },
                },
                { status: 503 },
            );
        }

        // Verificar conexão
        const startTime = Date.now();
        await db.execute(sql`SELECT 1`);
        const dbLatency = Date.now() - startTime;

        return NextResponse.json(
            {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: {
                    status: 'connected',
                    latency: `${dbLatency}ms`,
                },
                environment: process.env.NODE_ENV,
                version: process.env.npm_package_version || 'unknown',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Health check failed:', error);

        return NextResponse.json(
            {
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                database: {
                    status: 'disconnected',
                    error: error instanceof Error ? error.message : 'Unknown error',
                },
            },
            { status: 503 },
        );
    }
}
