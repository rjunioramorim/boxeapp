"use server";

import { revalidatePath } from "next/cache";
import {
    listarAgendamentosDiaService,
    marcarPresencaService,
} from "@/services/agendamentos";
import { requireAuth } from "@/lib/auth";

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
