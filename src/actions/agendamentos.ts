"use server";

import { revalidatePath } from "next/cache";
import {
    listarAgendamentosDiaService,
    marcarPresencaService,
    agendarManualService,
} from "@/services/agendamentos";
import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { alunos, matriculas } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Lista agendamentos para um dia
 */
export async function listarAgendamentosDia(dateStr: string) {
    await requireAuth();
    try {
        const date = dateStr ? new Date(dateStr) : new Date();
        return await listarAgendamentosDiaService(date);
    } catch (error) {
        console.error("Erro ao listar agendamentos:", error);
        return [];
    }
}

/**
 * Marcar presença ou falta
 */
export async function marcarPresenca(id: string, status: "PRESENTE" | "AUSENTE" | "AGENDADO") {
    await requireAuth();
    try {
        await marcarPresencaService(id, status);
        revalidatePath("/agendamentos");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao marcar presença",
        };
    }
}

/**
 * Incluir aluno manualmente em uma aula
 */
export async function incluirAlunoAgendamento(data: {
    alunoId: string;
    aulaId: string;
    data: string;
    horario: string;
}) {
    await requireAuth();

    try {
        // Buscar matrícula ativa do aluno
        const matricula = await db.query.matriculas.findFirst({
            where: and(
                eq(matriculas.alunoId, data.alunoId),
                eq(matriculas.status, "ATIVA")
            ),
        });

        if (!matricula) {
            return { success: false, error: "Aluno não possui matrícula ativa" };
        }

        await agendarManualService({
            alunoId: data.alunoId,
            aulaId: data.aulaId,
            matriculaId: matricula.id,
            data: new Date(data.data),
            horario: data.horario,
        });

        revalidatePath("/agendamentos");
        return { success: true };
    } catch (error) {
        console.error("Erro ao incluir aluno:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao incluir aluno",
        };
    }
}

/**
 * Busca alunos ativos para o seletor de agendamento
 */
export async function listarAlunosAtivos() {
    await requireAuth();

    try {
        return await db.query.alunos.findMany({
            where: eq(alunos.status, "ATIVO"),
            orderBy: (alunos, { asc }) => [asc(alunos.nome)],
        });
    } catch (error) {
        console.error("Erro ao listar alunos ativos:", error);
        return [];
    }
}
