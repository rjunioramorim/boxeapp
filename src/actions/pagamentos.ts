"use server";

import { revalidatePath } from "next/cache";
import {
    listarPagamentosService,
    confirmarPagamentoService,
    buscarPagamentoService,
} from "@/services/pagamentos";
import { requireAuth } from "@/lib/auth";

/**
 * Lista pagamentos com filtros
 */
export async function listarPagamentos(filters?: {
    mes?: string; // Vem como string ISO ou similar do client
    status?: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
    alunoNome?: string;
}) {
    await requireAuth();

    const parsedFilters = {
        ...filters,
        mes: filters?.mes ? new Date(filters.mes) : undefined,
    };

    try {
        return await listarPagamentosService(parsedFilters);
    } catch (error) {
        console.error("Erro ao listar pagamentos:", error);
        return [];
    }
}

/**
 * Confirma um pagamento
 */
export async function confirmarPagamentoAction(id: string, formData: FormData) {
    await requireAuth();

    const valorPago = formData.get("valorPago") as string;
    const dataPagamentoStr = formData.get("dataPagamento") as string;
    const observacoes = formData.get("observacoes") as string;

    try {
        const dataPagamento = dataPagamentoStr ? new Date(dataPagamentoStr) : new Date();

        await confirmarPagamentoService(id, {
            valorPago,
            dataPagamento,
            observacoes: observacoes || undefined,
        });

        revalidatePath("/pagamentos");
        revalidatePath("/dashboard");
        // Também revalidar o perfil do aluno se possível, mas precisamos do alunoId.
        // O service retorna o pagamento com matriculaId, podemos usar isso se necessário.

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao confirmar pagamento",
        };
    }
}
