// scripts/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const runMigrations = async () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL não está definida');
    }

    console.log('🔄 Conectando ao banco de dados...');

    // Conexão específica para migrações (max 1 conexão)
    const migrationClient = postgres(databaseUrl, {
        max: 1,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const db = drizzle(migrationClient);

    try {
        console.log('🚀 Executando migrações...');

        await migrate(db, {
            migrationsFolder: './drizzle/migrations',
            migrationsTable: 'drizzle_migrations'
        });

        console.log('✅ Migrações executadas com sucesso!');

        // Verificar última migração aplicada
        const result = await migrationClient`
      SELECT * FROM drizzle_migrations 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

        if (result.length > 0) {
            console.log('📋 Última migração aplicada:', result[0].name);
            console.log('⏰ Aplicada em:', result[0].created_at);
        }

    } catch (error) {
        console.error('❌ Erro ao executar migrações:', error);
        process.exit(1);
    } finally {
        await migrationClient.end();
    }
};

runMigrations().catch((err) => {
    console.error('❌ Falha crítica na migração:', err);
    process.exit(1);
});