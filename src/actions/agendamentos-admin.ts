"use server";

import { db } from "@/db";
import { agendamentos, matriculas } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { startOfDay, addDays } from "date-fns";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Limpa e recria todos os agendamentos futuros de uma matrícula
 * Útil para corrigir inconsistências
 */
export async function limparERecriarAgendamentos(matriculaId: string, alunoId: string) {
    await requireAuth();


    try {
        // Buscar matrícula com suas aulas
        const matricula = await db.query.matriculas.findFirst({
            where: eq(matriculas.id, matriculaId),
            with: {
                matriculasAulas: {
                    with: {
                        aula: true
                    }
                }
            }
        });

        if (!matricula) {
            return { success: false, error: "Matrícula não encontrada" };
        }

        // Executar limpeza e recriação em transação
        await db.transaction(async (tx) => {
            const agora = new Date();
            const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));

            // 1. Deletar TODOS os agendamentos futuros desta matrícula
            await tx.delete(agendamentos).where(
                and(
                    eq(agendamentos.matriculaId, matriculaId),
                    sql`${agendamentos.data} >= ${hoje}`
                )
            );

            // 2. Recriar agendamentos para os próximos 30 dias
            const agendamentosValues = [];
            for (let i = 0; i < 30; i++) {
                const dataAgendamento = addDays(hoje, i);
                const diaSemana = dataAgendamento.getUTCDay() === 0 ? 7 : dataAgendamento.getUTCDay();

                for (const ma of matricula.matriculasAulas) {
                    // Verificar se diasSemana existe e contém o dia atual
                    if (ma.diasSemana && ma.diasSemana.includes(diaSemana) && ma.horario) {
                        agendamentosValues.push({
                            aulaId: ma.aulaId,
                            alunoId: matricula.alunoId,
                            matriculaId: matricula.id,
                            data: dataAgendamento,
                            horario: ma.horario,
                            status: "AGENDADO" as const,
                            tipo: "AUTOMATICO" as const,
                        });
                    }
                }
            }

            if (agendamentosValues.length > 0) {
                await tx.insert(agendamentos).values(agendamentosValues);
            }
        });

        revalidatePath(`/alunos/${alunoId}`);
        revalidatePath("/agendamentos");

        return { success: true, message: "Agendamentos recriados com sucesso" };
    } catch (error) {
        console.error("[limparERecriarAgendamentos] Erro:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao recriar agendamentos"
        };
    }
}
