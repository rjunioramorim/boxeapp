import { getDb } from "@/db";
import { pagamentos, matriculas, alunos, matriculasAulas, agendamentos } from "@/db/schema";
import { eq, and, desc, asc, between, ilike, or } from "drizzle-orm";
import { startOfMonth, endOfMonth, addMonths, addDays } from "date-fns";
import { calcularDataVencimento } from "@/lib/utils";

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
        whereClauses.push(
            or(
                between(pagamentos.mesReferencia, start, end),
                between(pagamentos.dataVencimento, start, end)
            )
        );
    }

    if (filters?.status) {
        whereClauses.push(eq(pagamentos.status, filters.status));
    }

    const db = getDb();
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
    const db = getDb();
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
 * Confirma o recebimento de um pagamento e gera o próximo se necessário
 */
export async function confirmarPagamento(id: string, data: {
    valorPago: string;
    dataPagamento: Date;
    observacoes?: string;
}) {
    const db = getDb();
    return await db.transaction(async (tx) => {
        // 1. Atualizar pagamento atual
        const [pagamentoAtualizado] = await tx
            .update(pagamentos)
            .set({
                valorPago: data.valorPago,
                dataPagamento: data.dataPagamento,
                status: "PAGO",
                observacoes: data.observacoes,
            })
            .where(eq(pagamentos.id, id))
            .returning();

        if (!pagamentoAtualizado) return null;

        // 2. Buscar dados da matrícula e plano para saber o valor e dia de vencimento
        const matriculaInfo = await tx.query.matriculas.findFirst({
            where: eq(matriculas.id, pagamentoAtualizado.matriculaId),
            with: {
                plano: true
            }
        });

        if (matriculaInfo && matriculaInfo.status === "ATIVA") {
            // 3. Verificar se já existe um pagamento para o próximo mês
            const proximoMesReferencia = addMonths(new Date(pagamentoAtualizado.mesReferencia), 1);
            const startProximo = startOfMonth(proximoMesReferencia);
            const endProximo = endOfMonth(proximoMesReferencia);

            const proximoExistente = await tx.query.pagamentos.findFirst({
                where: and(
                    eq(pagamentos.matriculaId, pagamentoAtualizado.matriculaId),
                    between(pagamentos.mesReferencia, startProximo, endProximo)
                )
            });

            if (!proximoExistente) {
                // 4. Calcular data de vencimento do próximo mês
                // mesReferencia é o mês cheio, dataVencimento deve usar o diaVencimento da matricula
                const proximoVencimento = calcularDataVencimento(proximoMesReferencia, matriculaInfo.diaVencimento);

                // Criar o próximo pagamento
                await tx.insert(pagamentos).values({
                    matriculaId: pagamentoAtualizado.matriculaId,
                    valorEsperado: matriculaInfo.plano.valor,
                    mesReferencia: proximoVencimento, // Baseado no vencimento
                    dataVencimento: proximoVencimento,
                    status: "PENDENTE",
                });
            }

            // 5. Gerar novos agendamentos para os próximos 30 dias
            // Buscamos os dias/horários configurados para essa matrícula
            const aulasMatricula = await tx.query.matriculasAulas.findMany({
                where: and(
                    eq(matriculasAulas.matriculaId, pagamentoAtualizado.matriculaId),
                    eq(matriculasAulas.ativo, true)
                )
            });

            if (aulasMatricula.length > 0) {
                const agendamentosValues = [];
                const dataInicioAgendamentos = addDays(new Date(pagamentoAtualizado.dataVencimento), 1);

                for (let i = 0; i < 30; i++) {
                    const dataAgendamento = addDays(dataInicioAgendamentos, i);
                    const diaSemana = dataAgendamento.getUTCDay() === 0 ? 7 : dataAgendamento.getUTCDay();

                    for (const aulaConfig of aulasMatricula) {
                        if (aulaConfig.diasSemana?.includes(diaSemana)) {
                            agendamentosValues.push({
                                aulaId: aulaConfig.aulaId,
                                alunoId: matriculaInfo.alunoId,
                                matriculaId: matriculaInfo.id,
                                data: dataAgendamento,
                                horario: aulaConfig.horario || "00:00:00", // Fallback seguro
                                status: "AGENDADO" as const,
                                tipo: "AUTOMATICO" as const,
                            });
                        }
                    }
                }

                if (agendamentosValues.length > 0) {
                    await tx.insert(agendamentos).values(agendamentosValues).onConflictDoNothing();
                }
            }
        }

        return pagamentoAtualizado;
    });
}

/**
 * Cancela um pagamento
 */
export async function cancelarPagamento(id: string) {
    const db = getDb();
    const [pagamentoCancelado] = await db
        .update(pagamentos)
        .set({ status: "CANCELADO" })
        .where(eq(pagamentos.id, id))
        .returning();

    return pagamentoCancelado;
}

/**
 * Cria um novo pagamento manualmente
 */
export async function criarPagamentoManual(data: {
    matriculaId: string;
    valorEsperado: string;
    mesReferencia: Date;
    dataVencimento: Date;
    status: "PENDENTE" | "PAGO";
    valorPago?: string;
    dataPagamento?: Date;
    observacoes?: string;
}) {
    const db = getDb();
    const [novoPagamento] = await tx_or_db(db).insert(pagamentos).values({
        matriculaId: data.matriculaId,
        valorEsperado: data.valorEsperado,
        mesReferencia: data.mesReferencia,
        dataVencimento: data.dataVencimento,
        status: data.status,
        valorPago: data.valorPago,
        dataPagamento: data.dataPagamento,
        observacoes: data.observacoes,
    }).returning();

    return novoPagamento;
}

// Auxiliar para lidar com transações se necessário futuramente
const tx_or_db = (db_or_tx: any) => db_or_tx;

