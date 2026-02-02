// src/db/index.ts
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definida');
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!db) {
    pool = createPool();
    db = drizzle(pool, { schema });
  }

  return db;
}

export function getPool(): Pool {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    throw new Error('DB acessado durante build');
  }
  if (!pool) {
    pool = createPool();
  }

  return pool;
}
