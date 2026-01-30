"use server";

import { revalidatePath } from "next/cache";
import {
    listarAlunosService,
    buscarAlunoService,
    criarAlunoService,
    atualizarAlunoService,
    deletarAlunoService,
} from "@/services/alunos";
import { alunoSchema, alunoUpdateSchema } from "@/schemas/alunos";
import { requireAuth } from "@/lib/auth";
import { ZodError } from "zod";

/**
 * Lista todos os alunos
 */
export async function listarAlunos(filters?: {
    nome?: string;
    telefone?: string;
    status?: "ATIVO" | "INATIVO" | "SUSPENSO";
}) {
    await requireAuth();
    try {
        return await listarAlunosService(filters);
    } catch (error) {
        console.error("Erro ao listar alunos:", error);
        return [];
    }
}

/**
 * Busca aluno por ID
 */
export async function buscarAluno(id: string) {
    await requireAuth();
    try {
        return await buscarAlunoService(id);
    } catch (error) {
        console.error("Erro ao buscar aluno:", error);
        return null;
    }
}

/**
 * Cria um novo aluno
 */
export async function criarAluno(formData: FormData) {
    await requireAuth();

    const rawData = {
        nome: formData.get("nome") as string,
        telefone: formData.get("telefone") as string,
        email: formData.get("email") as string,
        status: formData.get("status") as "ATIVO" | "INATIVO" | "SUSPENSO",
    };

    try {
        const validated = alunoSchema.parse(rawData);
        const novoAluno = await criarAlunoService(validated);

        revalidatePath("/alunos");
        return { success: true, data: novoAluno };
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
 * Atualiza um aluno
 */
export async function atualizarAluno(id: string, formData: FormData) {
    await requireAuth();

    const rawData: any = {};
    const nome = formData.get("nome");
    const telefone = formData.get("telefone");
    const email = formData.get("email");
    const status = formData.get("status");

    if (nome) rawData.nome = nome as string;
    if (telefone) rawData.telefone = telefone as string;
    if (email !== null) rawData.email = email as string;
    if (status) rawData.status = status as "ATIVO" | "INATIVO" | "SUSPENSO";

    try {
        const validated = alunoUpdateSchema.parse(rawData);
        const alunoAtualizado = await atualizarAlunoService(id, validated);

        revalidatePath("/alunos");
        revalidatePath(`/alunos/${id}`);
        return { success: true, data: alunoAtualizado };
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
 * Deleta um aluno
 */
export async function deletarAluno(id: string) {
    await requireAuth();

    try {
        await deletarAlunoService(id);
        revalidatePath("/alunos");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao deletar aluno",
        };
    }
}
