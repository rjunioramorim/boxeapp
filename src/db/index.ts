// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não está definida');
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}

export function getDb() {
  if (!db) {
    pool = createPool();
    db = drizzle(pool, { schema });
  }

  return db;
}

export function getPool() {
  if (!pool) {
    pool = createPool();
  }

  return pool;
}
