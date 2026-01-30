import {
    getAllAlunos,
    getAlunoById,
    createAluno,
    updateAluno,
    deleteAluno,
} from "@/db/queries/alunos";
import type { AlunoFormValues, AlunoUpdateValues } from "@/schemas/alunos";
import type { alunos } from "@/db/schema";

type Aluno = typeof alunos.$inferSelect;

/**
 * Service para listar alunos com filtros
 */
export async function listarAlunosService(filters?: {
    nome?: string;
    telefone?: string;
    status?: "ATIVO" | "INATIVO" | "SUSPENSO";
}) {
    return await getAllAlunos(filters);
}

/**
 * Service para buscar aluno por ID
 */
export async function buscarAlunoService(id: string) {
    if (!id) throw new Error("ID do aluno é obrigatório");
    const aluno = await getAlunoById(id);
    if (!aluno) throw new Error("Aluno não encontrado");
    return aluno;
}

/**
 * Service para criar aluno
 */
export async function criarAlunoService(data: AlunoFormValues): Promise<Aluno> {
    return await createAluno(data);
}

/**
 * Service para atualizar aluno
 */
export async function atualizarAlunoService(
    id: string,
    data: AlunoUpdateValues
): Promise<Aluno> {
    if (!id) throw new Error("ID do aluno é obrigatório");
    const aluno = await updateAluno(id, data);
    if (!aluno) throw new Error("Aluno não encontrado ou não atualizado");
    return aluno;
}

/**
 * Service para deletar aluno
 */
export async function deletarAlunoService(id: string): Promise<void> {
    if (!id) throw new Error("ID do aluno é obrigatório");
    const aluno = await deleteAluno(id);
    if (!aluno) throw new Error("Aluno não encontrado");
}
