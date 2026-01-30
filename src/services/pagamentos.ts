import {
    getAllPagamentos,
    getPagamentoById,
    confirmarPagamento,
    cancelarPagamento,
    criarPagamentoManual,
} from "@/db/queries/pagamentos";

/**
 * Service para listar pagamentos com filtros
 */
export async function listarPagamentosService(filters?: {
    mes?: Date;
    status?: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
    alunoNome?: string;
}) {
    return await getAllPagamentos(filters);
}

/**
 * Service para confirmar pagamento
 */
export async function confirmarPagamentoService(id: string, data: {
    valorPago: string;
    dataPagamento: Date;
    observacoes?: string;
}) {
    if (!id) throw new Error("ID do pagamento é obrigatório");
    const pagamento = await confirmarPagamento(id, data);
    if (!pagamento) throw new Error("Pagamento não encontrado");
    return pagamento;
}

/**
 * Service para buscar pagamento por ID
 */
export async function buscarPagamentoService(id: string) {
    if (!id) throw new Error("ID do pagamento é obrigatório");
    const pagamento = await getPagamentoById(id);
    if (!pagamento) throw new Error("Pagamento não encontrado");
    return pagamento;
}

/**
 * Service para criar pagamento manual
 */
export async function criarPagamentoManualService(data: {
    matriculaId: string;
    valorEsperado: string;
    mesReferencia: Date;
    dataVencimento: Date;
    status: "PENDENTE" | "PAGO";
    valorPago?: string;
    dataPagamento?: Date;
    observacoes?: string;
}) {
    return await criarPagamentoManual(data);
}
