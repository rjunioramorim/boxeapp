import {
    getMatriculaById,
    getMatriculaAtivaPorAluno,
    createMatriculaCompleta,
    updateMatriculaStatus,
    updateMatriculaAulas,
} from "@/db/queries/matriculas";
import { buscarPlanoService } from "./planos";
import type { MatriculaCompletaValues } from "@/schemas/matriculas";

/**
 * Service para buscar matrícula por ID
 */
export async function buscarMatriculaService(id: string) {
    const matricula = await getMatriculaById(id);
    if (!matricula) throw new Error("Matrícula não encontrada");
    return matricula;
}

/**
 * Service para criar matrícula completa
 * Inclui aluno, vínculo com plano, aulas e o primeiro pagamento
 */
export async function criarMatriculaCompletaService(data: MatriculaCompletaValues) {
    // 1. Validar se o plano existe e pegar o valor
    const plano = await buscarPlanoService(data.planoId);
    if (!plano) throw new Error("Plano selecionado não existe");

    // 2. Chamar a query transacional
    return await createMatriculaCompleta({
        ...data,
        valorPlano: plano.valor,
    });
}

/**
 * Service para cancelar matrícula
 */
export async function cancelarMatriculaService(id: string) {
    if (!id) throw new Error("ID da matrícula é obrigatório");
    return await updateMatriculaStatus(id, "CANCELADA");
}

/**
 * Service para suspender matrícula
 */
export async function suspenderMatriculaService(id: string) {
    if (!id) throw new Error("ID da matrícula é obrigatório");
    return await updateMatriculaStatus(id, "SUSPENSA");
}

/**
 * Service para ativar matrícula (ex: após suspensão)
 */
export async function ativarMatriculaService(id: string) {
    if (!id) throw new Error("ID da matrícula é obrigatório");
    return await updateMatriculaStatus(id, "ATIVA");
}

/**
 * Service para atualizar horários da matrícula
 */
export async function atualizarHorariosMatriculaService(
    matriculaId: string,
    aulas: { aulaId: string; diasSemana: number[]; horario: string; }[]
) {
    if (!matriculaId) throw new Error("ID da matrícula é obrigatório");
    return await updateMatriculaAulas(matriculaId, aulas);
}
