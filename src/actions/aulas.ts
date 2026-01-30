"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
    listarAulasService,
    buscarAulaService,
    criarAulaService,
    atualizarAulaService,
    deletarAulaService,
    vincularAulasAoPlanoService,
} from "@/services/aulas";
import { aulaSchema, aulaUpdateSchema } from "@/schemas/aulas";

/**
 * Lista todas as aulas
 */
export async function listarAulas() {
    await requireAuth();
    return await listarAulasService();
}

/**
 * Busca uma aula por ID
 */
export async function buscarAula(id: string) {
    await requireAuth();
    return await buscarAulaService(id);
}

/**
 * Cria uma nova aula
 */
export async function criarAula(formData: FormData) {
    await requireAuth();

    const rawData = {
        nome: formData.get("nome") as string,
        diasSemana: JSON.parse(formData.get("diasSemana") as string) as number[],
        horario: formData.get("horario") as string,
        duracaoMinutos: parseInt(formData.get("duracaoMinutos") as string),
        capacidadeMaxima: parseInt(formData.get("capacidadeMaxima") as string),
        ativo: formData.get("ativo") === "true" || formData.get("ativo") === "on",
    };

    const validated = aulaSchema.parse(rawData);

    try {
        const novaAula = await criarAulaService(validated);

        revalidatePath("/aulas");
        return { success: true, data: novaAula };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues.map((e) => e.message).join(", "),
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar aula",
        };
    }
}

/**
 * Atualiza uma aula
 */
export async function atualizarAula(id: string, formData: FormData) {
    await requireAuth();

    if (!id) {
        return { success: false, error: "ID da aula é obrigatório" };
    }

    const rawData: Record<string, unknown> = {};
    const nome = formData.get("nome");
    const diasSemana = formData.get("diasSemana");
    const horario = formData.get("horario");
    const duracaoMinutos = formData.get("duracaoMinutos");
    const capacidadeMaxima = formData.get("capacidadeMaxima");
    const ativo = formData.get("ativo");

    if (nome) rawData.nome = nome as string;
    if (diasSemana) rawData.diasSemana = JSON.parse(diasSemana as string);
    if (horario) rawData.horario = horario as string;
    if (duracaoMinutos) rawData.duracaoMinutos = parseInt(duracaoMinutos as string);
    if (capacidadeMaxima) rawData.capacidadeMaxima = parseInt(capacidadeMaxima as string);
    if (ativo !== null) {
        rawData.ativo = ativo === "true" || ativo === "on";
    }

    const validated = aulaUpdateSchema.parse(rawData);

    try {
        const aulaAtualizada = await atualizarAulaService(id, validated);

        revalidatePath("/aulas");
        revalidatePath(`/aulas/${id}/editar`);
        return { success: true, data: aulaAtualizada };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues.map((e) => e.message).join(", "),
            };
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao atualizar aula",
        };
    }
}

/**
 * Deleta uma aula
 */
export async function deletarAula(id: string) {
    await requireAuth();

    try {
        await deletarAulaService(id);
        revalidatePath("/aulas");
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao deletar aula",
        };
    }
}

/**
 * Vincula aulas a um plano
 */
export async function atualizarAulasDoPlano(planoId: string, aulaIds: string[]) {
    await requireAuth();

    try {
        await vincularAulasAoPlanoService(planoId, aulaIds);
        revalidatePath("/planos");
        revalidatePath(`/planos/${planoId}/editar`);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao vincular aulas",
        };
    }
}
