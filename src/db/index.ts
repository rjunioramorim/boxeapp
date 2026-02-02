// src/db/index.ts (ou @/db)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Carregar variáveis de ambiente se não estiverem definidas (útil para scripts)
if (!process.env.DATABASE_URL) {
  // Tenta carregar .env (padrão)
  dotenv.config({ path: resolve(process.cwd(), ".env") });

  // Sobrescreve com .env.local se existir
  dotenv.config({ path: resolve(process.cwd(), ".env.local"), override: true });
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está definida nas variáveis de ambiente");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
export { pool };
