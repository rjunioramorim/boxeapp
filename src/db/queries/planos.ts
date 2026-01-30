import { db } from "@/db";
import { planos, aulas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";


type TipoPlano = "INDIVIDUAL" | "COLETIVO";

/**
 * Lista todos os planos
 */
export async function getAllPlanos() {
  return await db.select().from(planos).orderBy(desc(planos.createdAt));
}


/**
 * Busca um plano por ID
 */
export async function getPlanoById(id: string) {
  const [plano] = await db.select().from(planos).where(eq(planos.id, id));
  return plano || null;
}


/**
 * Cria um novo plano
 */
export async function createPlano(data: {
  nome: string;
  tipo: TipoPlano;
  valor: string; // numeric como string
  qtdDias?: number;
  ativo?: boolean;
}) {
  const [novoPlano] = await db
    .insert(planos)
    .values({
      nome: data.nome,
      tipo: data.tipo,
      valor: data.valor,
      qtdDias: data.qtdDias ?? 3,
      ativo: data.ativo ?? true,
    })
    .returning();

  return novoPlano;
}

/**
 * Atualiza um plano
 */
export async function updatePlano(
  id: string,
  data: {
    nome?: string;
    tipo?: TipoPlano;
    valor?: string;
    qtdDias?: number;
    ativo?: boolean;
  }
) {
  const [planoAtualizado] = await db
    .update(planos)
    .set(data)
    .where(eq(planos.id, id))
    .returning();

  return planoAtualizado || null;
}

/**
 * Deleta um plano
 */
export async function deletePlano(id: string) {
  const [planoDeletado] = await db
    .delete(planos)
    .where(eq(planos.id, id))
    .returning();

  return planoDeletado || null;
}
