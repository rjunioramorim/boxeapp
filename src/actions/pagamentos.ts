"use server";

import { revalidatePath } from "next/cache";
import {
    listarPagamentosService,
    confirmarPagamentoService,
    buscarPagamentoService,
    criarPagamentoManualService,
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
        mes: filters?.mes ? new Date(`${filters.mes}-01T12:00:00`) : undefined,
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

/**
 * Cria um pagamento manual
 */
export async function criarPagamentoManualAction(formData: FormData) {
    await requireAuth();

    const matriculaId = formData.get("matriculaId") as string;
    const alunoId = formData.get("alunoId") as string;
    const valorEsperado = formData.get("valorEsperado") as string;
    const mesReferenciaStr = formData.get("mesReferencia") as string;
    const dataVencimentoStr = formData.get("dataVencimento") as string;
    const status = formData.get("status") as "PENDENTE" | "PAGO";
    const valorPago = formData.get("valorPago") as string;
    const dataPagamentoStr = formData.get("dataPagamento") as string;
    const observacoes = formData.get("observacoes") as string;

    try {
        if (!matriculaId) throw new Error("Matrícula é obrigatória");

        // Ajustar datas para evitar problemas de fuso horário local
        // mesReferencia costuma vir como "yyyy-MM" no input type="month"
        const mesReferencia = new Date(`${mesReferenciaStr}-01T12:00:00`);
        const dataVencimento = new Date(`${dataVencimentoStr}T12:00:00`);
        const dataPagamento = dataPagamentoStr ? new Date(`${dataPagamentoStr}T12:00:00`) : undefined;

        await criarPagamentoManualService({
            matriculaId,
            valorEsperado,
            mesReferencia,
            dataVencimento,
            status,
            valorPago: valorPago || undefined,
            dataPagamento: dataPagamento || undefined,
            observacoes: observacoes || undefined,
        });

        revalidatePath("/pagamentos");
        if (alunoId) {
            revalidatePath(`/alunos/${alunoId}`);
        }
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erro ao criar pagamento",
        };
    }
}

