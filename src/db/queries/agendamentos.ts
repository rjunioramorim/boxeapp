import { db } from "@/db";
import { agendamentos, aulas, alunos, matriculas } from "@/db/schema";
import { eq, and, between, asc, desc, sql } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

/**
 * Busca agendamentos de um dia específico, agrupados ou detalhados
 */
export async function getAgendamentosPordia(data: Date) {
    const start = startOfDay(data);
    const end = endOfDay(data);

    return await db
        .select({
            id: agendamentos.id,
            data: agendamentos.data,
            horario: agendamentos.horario,
            status: agendamentos.status,
            tipo: agendamentos.tipo,
            aula: {
                id: aulas.id,
                nome: aulas.nome,
            },
            aluno: {
                id: alunos.id,
                nome: alunos.nome,
                telefone: alunos.telefone,
            },
            matriculaId: agendamentos.matriculaId,
        })
        .from(agendamentos)
        .innerJoin(aulas, eq(agendamentos.aulaId, aulas.id))
        .innerJoin(alunos, eq(agendamentos.alunoId, alunos.id))
        .where(and(between(agendamentos.data, start, end), eq(agendamentos.status, "AGENDADO")))
        .orderBy(asc(agendamentos.horario), asc(alunos.nome));
}

/**
 * Busca TODOS os agendamentos de um dia (incluindo presentes/ausentes)
 */
export async function getRelatorioPresencaDia(data: Date) {
    const start = startOfDay(data);
    const end = endOfDay(data);

    return await db
        .select({
            id: agendamentos.id,
            data: agendamentos.data,
            horario: agendamentos.horario,
            status: agendamentos.status,
            tipo: agendamentos.tipo,
            aula: {
                id: aulas.id,
                nome: aulas.nome,
            },
            aluno: {
                id: alunos.id,
                nome: alunos.nome,
            },
        })
        .from(agendamentos)
        .innerJoin(aulas, eq(agendamentos.aulaId, aulas.id))
        .innerJoin(alunos, eq(agendamentos.alunoId, alunos.id))
        .where(between(agendamentos.data, start, end))
        .orderBy(asc(agendamentos.horario), asc(alunos.nome));
}

/**
 * Atualiza o status de presença (PRESENTE, AUSENTE, AGENDADO)
 */
export async function updateStatusPresenca(id: string, status: "AGENDADO" | "PRESENTE" | "AUSENTE" | "CANCELADO") {
    const [agendamento] = await db
        .update(agendamentos)
        .set({
            status,
            updatedAt: new Date()
        })
        .where(eq(agendamentos.id, id))
        .returning();

    return agendamento;
}

/**
 * Adiciona um aluno manualmente a uma aula em um dia específico
 */
export async function agendarManual(data: {
    alunoId: string;
    aulaId: string;
    matriculaId: string;
    data: Date;
    horario: string;
}) {
    const [novoAgendamento] = await db
        .insert(agendamentos)
        .values({
            ...data,
            status: "AGENDADO",
            tipo: "MANUAL",
        })
        .returning();

    return novoAgendamento;
}

/**
 * Busca agendamentos futuros de um aluno para uma aula
 */
export async function getAgendamentosFuturosAluno(alunoId: string, dataInicio: Date) {
    return await db
        .select()
        .from(agendamentos)
        .where(
            and(
                eq(agendamentos.alunoId, alunoId),
                sql`${agendamentos.data} >= ${dataInicio}`
            )
        )
        .orderBy(asc(agendamentos.data), asc(agendamentos.horario));
}
