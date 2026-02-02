import { getDb } from "@/db";
import { alunos, pagamentos, agendamentos, aulas } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, format } from "date-fns";

export const dashboardQueries = {
    getStats: async () => {
        const db = getDb();
        const hoje = new Date();
        const inicioMes = startOfMonth(hoje);
        const fimMes = endOfMonth(hoje);
        const inicioDia = startOfDay(hoje);
        const fimDia = endOfDay(hoje);

        // 1. Total de Alunos Ativos
        const [alunosAtivos] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(alunos)
            .where(eq(alunos.status, "ATIVO"));

        // 2. Pagamentos Pendentes (Mês Atual)
        // Consideramos pendentes com vencimento dentro deste mês
        const [pagamentosPendentes] = await db
            .select({
                count: sql<number>`cast(count(*) as integer)`,
                total: sql<number>`cast(sum(${pagamentos.valorEsperado}) as float)`
            })
            .from(pagamentos)
            .where(
                and(
                    eq(pagamentos.status, "PENDENTE"),
                    gte(pagamentos.dataVencimento, inicioMes),
                    lte(pagamentos.dataVencimento, fimMes)
                )
            );

        // 3. Agendamentos Hoje
        const [agendamentosHoje] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(agendamentos)
            .where(
                eq(agendamentos.data, sql`CURRENT_DATE`) // Mais seguro confiar no banco para "hoje"? Ou passar data JS?
                // O campo 'data' no schema é 'date', então compara com string YYYY-MM-DD ou date object.
                // Vamos usar o range do JS para garantir timezone local controlada pelo server app se necessário,
                // MAS como 'data' é só data, podemos usar string.
            );

        // Melhor abordagem para 'date' column com Drizzle e Timezones:
        // Se o banco guarda YYYY-MM-DD, a query deve comparar com YYYY-MM-DD.
        // Usar sql`CURRENT_DATE` usa a data do servidor do banco (UTC costuma ser padrão).
        // Se o app roda em -03:00, "hoje" pode ser "ontem" no UTC.
        // Vamos filtrar pela string da data atual do servidor da APP.
        const hojeStr = format(hoje, "yyyy-MM-dd");

        const [agendamentosHojeResult] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(agendamentos)
            .where(eq(agendamentos.data, sql`${hojeStr}::date`));

        // 4. Presenças Hoje (Para taxa de comparecimento diária)
        const [presencasHoje] = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(agendamentos)
            .where(
                and(
                    eq(agendamentos.data, sql`${hojeStr}::date`),
                    eq(agendamentos.status, "PRESENTE")
                )
            );

        return {
            alunosAtivos: alunosAtivos?.count || 0,
            pagamentosPendentes: {
                qtd: pagamentosPendentes?.count || 0,
                total: pagamentosPendentes?.total || 0,
            },
            agendamentosHoje: agendamentosHojeResult?.count || 0,
            presencasHoje: presencasHoje?.count || 0,
        };
    }
};
