import {
  getAllPlanos,
  getPlanoById,
  getPlanoWithAulas,
  createPlano,
  updatePlano,
  deletePlano,
  type PlanoWithAulas,
} from "@/lib/db/queries/planos";
import type { planos } from "@/lib/db/schema";
import type { PlanoFormValues, PlanoUpdateValues } from "@/lib/schemas/planos";

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
  const novoPlano = await createPlano({
    nome: data.nome,
    tipo: data.tipo,
    valor: data.valor,
    qtdDias: data.qtdDias,
    ativo: data.ativo,
  });

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

  const planoAtualizado = await updatePlano(id, data);

  if (!planoAtualizado) {
    throw new Error("Plano não encontrado");
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
