import { db } from "@/db";
import { planos, planosAulas, aulas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export type PlanoWithAulas = typeof planos.$inferSelect & {
  aulas?: (typeof aulas.$inferSelect)[];
};

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
 * Busca um plano com suas aulas vinculadas
 */
export async function getPlanoWithAulas(id: string): Promise<PlanoWithAulas | null> {
  const plano = await getPlanoById(id);
  if (!plano) return null;

  const aulasVinculadas = await db
    .select({
      id: aulas.id,
      nome: aulas.nome,
      diasSemana: aulas.diasSemana,
      horario: aulas.horario,
      duracaoMinutos: aulas.duracaoMinutos,
      capacidadeMaxima: aulas.capacidadeMaxima,
      ativo: aulas.ativo,
      createdAt: aulas.createdAt,
    })
    .from(planosAulas)
    .innerJoin(aulas, eq(planosAulas.aulaId, aulas.id))
    .where(eq(planosAulas.planoId, id));

  return {
    ...plano,
    aulas: aulasVinculadas,
  };
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
