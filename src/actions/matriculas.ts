"use server";

import { revalidatePath } from "next/cache";
import {
    buscarMatriculaService,
    criarMatriculaCompletaService,
    cancelarMatriculaService,
    suspenderMatriculaService,
    ativarMatriculaService,
} from "@/services/matriculas";
import { matriculaCompletaSchema } from "@/schemas/matriculas";
import { requireAuth } from "@/lib/auth";
import { ZodError } from "zod";

/**
 * Cria uma matrícula completa (inclui aluno já existente ou novo?)
 * Nota: No PRD "novo cadastro" sugere criar aluno + matrícula.
 * Aqui assumiremos que o aluno já foi selecionado/criado.
 */
export async function criarMatriculaCompleta(data: {
    alunoId: string;
    planoId: string;
    diaVencimento: number;
    dataInicio: string; // Vem como string do formulário
    aulas: {
        aulaId: string;
        diasSemana: number[];
        horario: string;
    }[];
}) {
    await requireAuth();

    try {
        const validated = matriculaCompletaSchema.parse({
            ...data,
            dataInicio: new Date(data.dataInicio),
        });

        const result = await criarMatriculaCompletaService(validated);

        revalidatePath("/alunos");
        revalidatePath(`/alunos/${data.alunoId}`);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                error: "Erro de validação",
                issues: error.issues,
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro desconhecido",
        };
    }
}

/**
 * Cancela uma matrícula
 */
export async function cancelarMatricula(id: string, alunoId: string) {
    await requireAuth();
    try {
        await cancelarMatriculaService(id);
        revalidatePath(`/alunos/${alunoId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Erro ao cancelar" };
    }
}

/**
 * Suspende uma matrícula
 */
export async function suspenderMatricula(id: string, alunoId: string) {
    await requireAuth();
    try {
        await suspenderMatriculaService(id);
        revalidatePath(`/alunos/${alunoId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Erro ao suspender" };
    }
}

/**
 * Ativa uma matrícula
 */
export async function ativarMatricula(id: string, alunoId: string) {
    await requireAuth();
    try {
        await ativarMatriculaService(id);
        revalidatePath(`/alunos/${alunoId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Erro ao ativar" };
    }
}
