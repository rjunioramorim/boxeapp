// scripts/check-and-seed.js
import { getDb } from '../src/db'; // ajuste o caminho
import { sql } from 'drizzle-orm';

async function checkAndSeed() {
    try {
        // Exemplo: verificar se existe algum usuário
        const db = getDb();
        const result = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
        const count = result.rows[0].count;

        if (count === '0') {
            console.log('🌱 Banco vazio, executando seed...');
            // Importe e execute seu seed
            const { seed } = await import('./src/db/seed');
            await seed();
            console.log('✅ Seed executado com sucesso!');
        } else {
            console.log('✅ Banco já contém dados, pulando seed.');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar/executar seed:', error);
        // Não fazer exit aqui para não impedir a aplicação de subir
    }
}

checkAndSeed();