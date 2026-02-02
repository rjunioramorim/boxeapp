import { getDb } from "@/db";
import { alunos, matriculas, pagamentos, agendamentos } from "@/db/schema";
import { eq, ilike, and, desc, or } from "drizzle-orm";

type Pago = typeof pagamentos.$inferSelect;

/**
 * Lista todos os alunos com filtros opcionais
 */
export async function getAllAlunos(filters?: {
    nome?: string;
    telefone?: string;
    status?: "ATIVO" | "INATIVO" | "SUSPENSO";
}) {
    const whereClauses = [];

    if (filters?.nome) {
        whereClauses.push(ilike(alunos.nome, `%${filters.nome}%`));
    }

    if (filters?.telefone) {
        whereClauses.push(ilike(alunos.telefone, `%${filters.telefone}%`));
    }

    if (filters?.status) {
        whereClauses.push(eq(alunos.status, filters.status));
    }

    const db = getDb();
    return await db
        .select()
        .from(alunos)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(desc(alunos.createdAt));
}

/**
 * Busca um aluno por ID com seus detalhes (matrícula ativa, pagamentos, agendamentos)
 */
export async function getAlunoById(id: string) {
    const db = getDb();
    const aluno = await db.query.alunos.findFirst({
        where: eq(alunos.id, id),
        with: {
            matriculas: {
                where: eq(matriculas.status, "ATIVA"),
                with: {
                    plano: true,
                    matriculasAulas: {
                        with: {
                            aula: true,
                        },
                    },
                },
            },
            agendamentos: {
                limit: 10,
                orderBy: [desc(agendamentos.data), desc(agendamentos.horario)],
                with: {
                    aula: true,
                },
            },
        },
    });

    if (!aluno) return null;

    // Busca pagamentos separadamente para ter mais controle e ordenação
    const matriculaAtiva = aluno.matriculas?.[0];
    let pagamentosRecentes: Pago[] = [];

    if (matriculaAtiva) {
        pagamentosRecentes = await db
            .select()
            .from(pagamentos)
            .where(eq(pagamentos.matriculaId, matriculaAtiva.id))
            .orderBy(desc(pagamentos.mesReferencia))
            .limit(5);
    }

    return {
        ...aluno,
        pagamentosRecentes,
    };
}

/**
 * Cria um novo aluno
 */
export async function createAluno(data: {
    nome: string;
    telefone: string;
    email?: string;
    status: "ATIVO" | "INATIVO" | "SUSPENSO";
}) {
    const db = getDb();
    const [novoAluno] = await db.insert(alunos).values(data).returning();
    return novoAluno;
}

/**
 * Atualiza um aluno
 */
export async function updateAluno(
    id: string,
    data: {
        nome?: string;
        telefone?: string;
        email?: string | null;
        status?: "ATIVO" | "INATIVO" | "SUSPENSO";
    }
) {
    const db = getDb();
    const [alunoAtualizado] = await db
        .update(alunos)
        .set(data)
        .where(eq(alunos.id, id))
        .returning();
    return alunoAtualizado || null;
}

/**
 * Deleta um aluno
 */
export async function deleteAluno(id: string) {
    const db = getDb();
    const [alunoDeletado] = await db
        .delete(alunos)
        .where(eq(alunos.id, id))
        .returning();
    return alunoDeletado || null;
}
