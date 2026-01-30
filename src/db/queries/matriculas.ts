import { db } from "@/db";
import {
    matriculas,
    matriculasAulas,
    pagamentos,
    agendamentos,
    alunos,
} from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { addDays, format, startOfDay } from "date-fns";

/**
 * Busca matrícula por ID
 */
export async function getMatriculaById(id: string) {
    return await db.query.matriculas.findFirst({
        where: eq(matriculas.id, id),
        with: {
            aluno: true,
            plano: true,
            matriculasAulas: {
                with: {
                    aula: true,
                },
            },
        },
    });
}

/**
 * Busca matrícula ativa de um aluno
 */
export async function getMatriculaAtivaPorAluno(alunoId: string) {
    return await db.query.matriculas.findFirst({
        where: and(eq(matriculas.alunoId, alunoId), eq(matriculas.status, "ATIVA")),
        with: {
            plano: true,
            matriculasAulas: {
                with: {
                    aula: true,
                },
            },
        },
    });
}

/**
 * Cria uma matrícula completa em uma transação
 */
export async function createMatriculaCompleta(data: {
    alunoId?: string; // Se não fornecido, presume-se que o aluno já foi criado ou está sendo criado agora fora daqui
    planoId: string;
    diaVencimento: number;
    dataInicio: Date;
    valorPlano: string;
    aulas: {
        aulaId: string;
        diasSemana: number[];
        horario: string;
    }[];
}) {
    return await db.transaction(async (tx) => {
        if (!data.alunoId) {
            throw new Error("ID do aluno é obrigatório para criar matrícula");
        }

        // 1. Criar Matrícula
        const [novaMatricula] = await tx
            .insert(matriculas)
            .values({
                alunoId: data.alunoId,
                planoId: data.planoId,
                diaVencimento: data.diaVencimento,
                dataInicio: data.dataInicio,
                status: "ATIVA",
            })
            .returning();

        // 2. Criar Vínculos Matrícula-Aula (Matrículas Aulas)
        if (data.aulas.length > 0) {
            await tx.insert(matriculasAulas).values(
                data.aulas.map((a) => ({
                    matriculaId: novaMatricula.id,
                    aulaId: a.aulaId,
                    diasSemana: a.diasSemana,
                    horario: a.horario,
                    ativo: true,
                }))
            );
        }

        // 3. Criar Primeiro Pagamento
        // Definir data de vencimento (mesma data do início ou ajustado pelo diaVencimento?)
        // PRD diz: "primeiro pagamento"
        // Vamos usar a regra: mesReferencia = mês da data de início
        const [primeiroPagamento] = await tx
            .insert(pagamentos)
            .values({
                matriculaId: novaMatricula.id,
                valorEsperado: data.valorPlano,
                mesReferencia: data.dataInicio,
                dataVencimento: data.dataInicio, // Primeiro pagamento vence no ato/início
                status: "PENDENTE",
            })
            .returning();

        // 4. Gerar Agendamentos para os próximos 7 dias
        const agendamentosValues = [];
        for (let i = 0; i < 7; i++) {
            const dataAgendamento = addDays(data.dataInicio, i);
            const diaSemana = dataAgendamento.getDay() === 0 ? 7 : dataAgendamento.getDay(); // JS 0=Dom, Drizzle 1=Seg...7=Dom

            for (const aula of data.aulas) {
                if (aula.diasSemana.includes(diaSemana)) {
                    agendamentosValues.push({
                        aulaId: aula.aulaId,
                        alunoId: data.alunoId,
                        matriculaId: novaMatricula.id,
                        data: dataAgendamento,
                        horario: aula.horario,
                        status: "AGENDADO" as const,
                        tipo: "AUTOMATICO" as const,
                    });
                }
            }
        }

        if (agendamentosValues.length > 0) {
            await tx.insert(agendamentos).values(agendamentosValues);
        }

        return {
            matricula: novaMatricula,
            pagamento: primeiroPagamento,
        };
    });
}

/**
 * Atualiza status de uma matrícula
 */
export async function updateMatriculaStatus(id: string, status: "ATIVA" | "CANCELADA" | "SUSPENSA") {
    const [matriculaAtualizada] = await db
        .update(matriculas)
        .set({ status })
        .where(eq(matriculas.id, id))
        .returning();
    return matriculaAtualizada;
}

/**
 * Atualiza horários da matrícula e reagenda aulas futuras
 */
export async function updateMatriculaAulas(
    matriculaId: string,
    aulasData: {
        aulaId: string;
        diasSemana: number[];
        horario: string;
    }[],
    dataVencimentoProximo: Date
) {
    return await db.transaction(async (tx) => {
        // 1. Buscar dados da matrícula para alunoId
        const matricula = await tx.query.matriculas.findFirst({
            where: eq(matriculas.id, matriculaId)
        });
        if (!matricula) throw new Error("Matrícula não encontrada");

        // 2. Desativar/Remover aulas antigas na matrícula
        await tx.delete(matriculasAulas).where(eq(matriculasAulas.matriculaId, matriculaId));

        // 3. Inserir novas configurações de aulas
        if (aulasData.length > 0) {
            await tx.insert(matriculasAulas).values(
                aulasData.map(a => ({
                    matriculaId,
                    aulaId: a.aulaId,
                    diasSemana: a.diasSemana,
                    horario: a.horario,
                    ativo: true
                }))
            );
        }

        // 4. Deletar agendamentos futuros (apenas os que ainda estão como AGENDADO)
        // De hoje até o próximo vencimento
        const hoje = startOfDay(new Date());
        await tx.delete(agendamentos).where(
            and(
                eq(agendamentos.matriculaId, matriculaId),
                eq(agendamentos.status, "AGENDADO"),
                sql`${agendamentos.data} >= ${hoje}`
            )
        );

        // 5. Recriar agendamentos até a data de vencimento (máximo 31 dias por segurança)
        const agendamentosValues = [];
        let dataLoop = hoje;

        // Loop até o vencimento ou por no máximo 31 dias
        for (let i = 0; i < 32; i++) {
            const dataAgendamento = addDays(hoje, i);
            if (dataAgendamento > dataVencimentoProximo) break;

            const diaSemana = dataAgendamento.getDay() === 0 ? 7 : dataAgendamento.getDay();

            for (const aula of aulasData) {
                if (aula.diasSemana.includes(diaSemana)) {
                    agendamentosValues.push({
                        aulaId: aula.aulaId,
                        alunoId: matricula.alunoId,
                        matriculaId: matricula.id,
                        data: dataAgendamento,
                        horario: aula.horario,
                        status: "AGENDADO" as const,
                        tipo: "AUTOMATICO" as const,
                    });
                }
            }
        }

        if (agendamentosValues.length > 0) {
            await tx.insert(agendamentos).values(agendamentosValues);
        }

        return agendamentosValues.length;
    });
}
