import {
    getAllAulas,
    getAulaById,
    createAula,
    updateAula,
    deleteAula,
    getAulasByPlanoId,
    setAulasDoPlano,
} from "@/db/queries/aulas";
import type { AulaFormValues, AulaUpdateValues } from "@/schemas/aulas";

/**
 * Lista todas as aulas cadastradas
 */
export async function listarAulasService() {
    return await getAllAulas();
}

/**
 * Busca uma aula por ID ou lança erro se não encontrada
 */
export async function buscarAulaService(id: string) {
    const aula = await getAulaById(id);
    if (!aula) {
        throw new Error("Aula não encontrada");
    }
    return aula;
}

/**
 * Busca uma aula por ID ou retorna null
 */
export async function buscarAulaServiceOrNull(id: string) {
    return await getAulaById(id);
}

/**
 * Cria uma nova aula
 */
export async function criarAulaService(data: AulaFormValues) {
    return await createAula(data);
}

/**
 * Atualiza uma aula existente
 */
export async function atualizarAulaService(id: string, data: AulaUpdateValues) {
    const aula = await updateAula(id, data);
    if (!aula) {
        throw new Error("Aula não encontrada para atualização");
    }
    return aula;
}

/**
 * Remove uma aula
 */
export async function deletarAulaService(id: string) {
    const result = await deleteAula(id);
    if (!result) {
        throw new Error("Aula não encontrada para exclusão");
    }
}

/**
 * Busca aulas vinculadas a um plano
 */
export async function buscarAulasPorPlanoService(planoId: string) {
    return await getAulasByPlanoId(planoId);
}

/**
 * Vincula uma lista de IDs de aulas a um plano
 */
export async function vincularAulasAoPlanoService(
    planoId: string,
    aulaIds: string[]
) {
    await setAulasDoPlano(planoId, aulaIds);
}
