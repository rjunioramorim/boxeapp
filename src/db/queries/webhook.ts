import { startOfDay, endOfDay, parse } from "date-fns";
import { db } from "@/db";
import { agendamentos, alunos, aulas, matriculas } from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";

export const webhookQueries = {
    getAlunoByTelefone: async (telefone: string) => {
        return await db.query.alunos.findFirst({
            where: eq(alunos.telefone, telefone),
        });
    },

    getAulaByNomeOrId: async (identificador: string) => {
        // Tenta achar por ID uuid válido ou por nome (case insensitive)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identificador);

        if (isUuid) {
            const aula = await db.query.aulas.findFirst({
                where: eq(aulas.id, identificador),
            });
            if (aula) return aula;
        }

        // Busca por nome
        return await db.query.aulas.findFirst({
            where: sql`lower(${aulas.nome}) = ${identificador.toLowerCase()}`,
        });
    },

    getAgendamentoExistente: async (alunoId: string, data: Date, horario: string) => {
        return await db.query.agendamentos.findFirst({
            where: and(
                eq(agendamentos.alunoId, alunoId),
                eq(agendamentos.data, data),
                eq(agendamentos.horario, horario),
                sql`${agendamentos.status} != 'CANCELADO'`
            ),
            with: {
                aula: true,
            }
        });
    },

    checkConflitoHorario: async (alunoId: string, data: Date, horario: string) => {
        return await db.query.agendamentos.findFirst({
            where: and(
                eq(agendamentos.alunoId, alunoId),
                eq(agendamentos.data, data),
                eq(agendamentos.horario, horario),
                sql`${agendamentos.status} != 'CANCELADO'`
            ),
        });
    },

    findMatriculaAtiva: async (alunoId: string) => {
        return await db.query.matriculas.findFirst({
            where: and(
                eq(matriculas.alunoId, alunoId),
                eq(matriculas.status, "ATIVA")
            ),
        });
    },

    createAgendamento: async (data: typeof agendamentos.$inferInsert) => {
        return await db.insert(agendamentos).values(data).returning();
    },

    updateStatusAgendamento: async (id: string, status: "AGENDADO" | "PRESENTE" | "AUSENTE" | "CANCELADO") => {
        return await db
            .update(agendamentos)
            .set({ status, updatedAt: new Date() })
            .where(eq(agendamentos.id, id))
            .returning();
    }
};
