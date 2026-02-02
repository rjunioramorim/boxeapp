import { getDb } from '@/db';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        if (!process.env.DATABASE_URL) {
            return Response.json({ status: 'degraded' });
        }

        const db = getDb();
        await db.execute(sql`select 1`);

        return Response.json({ status: 'healthy' });
    } catch {
        return Response.json({ status: 'unhealthy' }, { status: 503 });
    }
}
