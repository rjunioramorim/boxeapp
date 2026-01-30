import { db } from "@/db";
import { pagamentos, matriculas, alunos } from "@/db/schema";
import { eq, and, desc, asc, between, ilike, or } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Lista pagamentos com filtros opcionais
 */
export async function getAllPagamentos(filters?: {
    mes?: Date;
    status?: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
    alunoNome?: string;
}) {
    const whereClauses = [];

    if (filters?.mes) {
        const start = startOfMonth(filters.mes);
        const end = endOfMonth(filters.mes);
        whereClauses.push(between(pagamentos.mesReferencia, start, end));
    }

    if (filters?.status) {
        whereClauses.push(eq(pagamentos.status, filters.status));
    }

    const baseQuery = db
        .select({
            id: pagamentos.id,
            valorEsperado: pagamentos.valorEsperado,
            valorPago: pagamentos.valorPago,
            mesReferencia: pagamentos.mesReferencia,
            dataVencimento: pagamentos.dataVencimento,
            dataPagamento: pagamentos.dataPagamento,
            status: pagamentos.status,
            observacoes: pagamentos.observacoes,
            aluno: {
                id: alunos.id,
                nome: alunos.nome,
            },
        })
        .from(pagamentos)
        .innerJoin(matriculas, eq(pagamentos.matriculaId, matriculas.id))
        .innerJoin(alunos, eq(matriculas.alunoId, alunos.id));

    if (filters?.alunoNome) {
        whereClauses.push(ilike(alunos.nome, `%${filters.alunoNome}%`));
    }

    return await baseQuery
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(desc(pagamentos.dataVencimento));
}

/**
 * Busca pagamento por ID
 */
export async function getPagamentoById(id: string) {
    return await db.query.pagamentos.findFirst({
        where: eq(pagamentos.id, id),
        with: {
            matricula: {
                with: {
                    aluno: true,
                    plano: true,
                },
            },
        },
    });
}

/**
 * Confirma o recebimento de um pagamento
 */
export async function confirmarPagamento(id: string, data: {
    valorPago: string;
    dataPagamento: Date;
    observacoes?: string;
}) {
    const [pagamentoAtualizado] = await db
        .update(pagamentos)
        .set({
            valorPago: data.valorPago,
            dataPagamento: data.dataPagamento,
            status: "PAGO",
            observacoes: data.observacoes,
        })
        .where(eq(pagamentos.id, id))
        .returning();

    return pagamentoAtualizado;
}

/**
 * Cancela um pagamento
 */
export async function cancelarPagamento(id: string) {
    const [pagamentoCancelado] = await db
        .update(pagamentos)
        .set({ status: "CANCELADO" })
        .where(eq(pagamentos.id, id))
        .returning();

    return pagamentoCancelado;
}
