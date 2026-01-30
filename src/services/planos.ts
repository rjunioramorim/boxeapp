import {
  getAllPlanos,
  getPlanoById,
  getPlanoWithAulas,
  createPlano,
  updatePlano,
  deletePlano,
  type PlanoWithAulas,
} from "@/db/queries/planos";
import { vincularAulasAoPlanoService } from "./aulas";
import type { planos } from "@/db/schema";
import type { PlanoFormValues, PlanoUpdateValues } from "@/schemas/planos";

type Plano = typeof planos.$inferSelect;

/**
 * Service para gerenciar planos
 * Encapsula a lógica de negócio e usa as queries do Drizzle
 */

/**
 * Lista todos os planos
 */
export async function listarPlanosService(): Promise<Plano[]> {
  return await getAllPlanos();
}

/**
 * Busca um plano por ID
 * @throws {Error} Se o ID não for fornecido ou plano não encontrado
 */
export async function buscarPlanoService(id: string): Promise<Plano> {
  if (!id) {
    throw new Error("ID do plano é obrigatório");
  }

  const plano = await getPlanoById(id);

  if (!plano) {
    throw new Error("Plano não encontrado");
  }

  return plano;
}

/**
 * Busca um plano por ID (retorna null se não encontrado)
 */
export async function buscarPlanoServiceOrNull(id: string): Promise<Plano | null> {
  if (!id) {
    return null;
  }
  return await getPlanoById(id);
}

/**
 * Busca um plano com suas aulas vinculadas
 */
export async function buscarPlanoComAulasService(id: string): Promise<PlanoWithAulas | null> {
  if (!id) {
    return null;
  }
  return await getPlanoWithAulas(id);
}

/**
 * Cria um novo plano
 */
export async function criarPlanoService(data: PlanoFormValues): Promise<Plano> {
  const { aulaIds, ...planoData } = data;
  const novoPlano = await createPlano(planoData);

  if (aulaIds && aulaIds.length > 0) {
    await vincularAulasAoPlanoService(novoPlano.id, aulaIds);
  }

  return novoPlano;
}

/**
 * Atualiza um plano
 * @throws {Error} Se o plano não for encontrado
 */
export async function atualizarPlanoService(
  id: string,
  data: PlanoUpdateValues
): Promise<Plano> {
  if (!id) {
    throw new Error("ID do plano é obrigatório");
  }

  const { aulaIds, ...planoData } = data;
  const planoAtualizado = await updatePlano(id, planoData);

  if (!planoAtualizado) {
    throw new Error("Plano não encontrado");
  }

  if (aulaIds !== undefined) {
    await vincularAulasAoPlanoService(id, aulaIds);
  }

  return planoAtualizado;
}

/**
 * Deleta um plano
 * @throws {Error} Se o plano não for encontrado
 */
export async function deletarPlanoService(id: string): Promise<void> {
  if (!id) {
    throw new Error("ID do plano é obrigatório");
  }

  const planoDeletado = await deletePlano(id);

  if (!planoDeletado) {
    throw new Error("Plano não encontrado");
  }
}
