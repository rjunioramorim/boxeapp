/**
 * Script de seed para criar usuário admin inicial
 * Executar com: npm run db:seed
 * ou: tsx src/db/seed.ts
 */

// IMPORTANTE: Carregar variáveis de ambiente ANTES de importar o db
import * as dotenv from "dotenv";
import { resolve } from "path";

// Carregar .env.local da raiz do projeto
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { getDb } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Iniciando seed...");

    // Verificar se DATABASE_URL está definida
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não está definida nas variáveis de ambiente");
    }

    // Email e senha do admin (pode ser configurado via env ou usar padrão)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@boxeapp.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "password";
    const adminName = process.env.ADMIN_NAME || "Administrador";

    // Verificar se já existe um usuário com esse email
    const db = getDb();
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`⚠️  Usuário com email ${adminEmail} já existe. Pulando criação.`);
      return;
    }

    // Gerar hash da senha
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Inserir usuário admin
    const [newUser] = await db
      .insert(users)
      .values({
        email: adminEmail,
        passwordHash,
        name: adminName,
      })
      .returning();

    console.log("✅ Usuário admin criado com sucesso!");
    console.log(`   Email: ${newUser.email}`);
    console.log(`   Nome: ${newUser.name}`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`\n🔐 Credenciais padrão:`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Senha: ${adminPassword}`);
    console.log(`\n💡 Para usar credenciais customizadas, defina no .env.local:`);
    console.log(`   ADMIN_EMAIL=seu-email@exemplo.com`);
    console.log(`   ADMIN_PASSWORD=sua-senha-segura`);
    console.log(`   ADMIN_NAME=Seu Nome`);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

// Executar seed
seed()
  .then(() => {
    console.log("\n✨ Seed concluído!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro fatal:", error);
    process.exit(1);
  });
