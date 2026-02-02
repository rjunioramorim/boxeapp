import { getDb } from "@/db";
import { aulas, planosAulas } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Lista todas as aulas
 */
export async function getAllAulas() {
  const db = getDb();
  return await db.select().from(aulas).orderBy(desc(aulas.createdAt));
}

/**
 * Busca uma aula por ID
 */
export async function getAulaById(id: string) {
  const db = getDb();
  const [aula] = await db.select().from(aulas).where(eq(aulas.id, id));
  return aula || null;
}

/**
 * Busca aulas vinculadas a um plano
 */
export async function getAulasByPlanoId(planoId: string) {
  const db = getDb();
  return await db
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
    .where(eq(planosAulas.planoId, planoId));
}

/**
 * Retorna IDs das aulas vinculadas a um plano
 */
export async function getAulaIdsByPlanoId(planoId: string): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .select({ aulaId: planosAulas.aulaId })
    .from(planosAulas)
    .where(eq(planosAulas.planoId, planoId));
  return rows.map((r) => r.aulaId);
}

/**
 * Cria uma nova aula
 * horario: string "HH:mm" ou "HH:mm:ss"
 */
export async function createAula(data: {
  nome: string;
  diasSemana: number[];
  horario: string;
  duracaoMinutos: number;
  capacidadeMaxima: number;
  ativo?: boolean;
}) {
  const db = getDb();
  const [novaAula] = await db
    .insert(aulas)
    .values({
      nome: data.nome,
      diasSemana: data.diasSemana,
      horario: data.horario.length === 5 ? `${data.horario}:00` : data.horario,
      duracaoMinutos: data.duracaoMinutos,
      capacidadeMaxima: data.capacidadeMaxima,
      ativo: data.ativo ?? true,
    })
    .returning();

  return novaAula;
}

/**
 * Atualiza uma aula
 */
export async function updateAula(
  id: string,
  data: {
    nome?: string;
    diasSemana?: number[];
    horario?: string;
    duracaoMinutos?: number;
    capacidadeMaxima?: number;
    ativo?: boolean;
  }
) {
  const db = getDb();
  const set: Record<string, unknown> = {};
  if (data.nome !== undefined) set.nome = data.nome;
  if (data.diasSemana !== undefined) set.diasSemana = data.diasSemana;
  if (data.horario !== undefined) {
    set.horario = data.horario.length === 5 ? `${data.horario}:00` : data.horario;
  }
  if (data.duracaoMinutos !== undefined) set.duracaoMinutos = data.duracaoMinutos;
  if (data.capacidadeMaxima !== undefined) set.capacidadeMaxima = data.capacidadeMaxima;
  if (data.ativo !== undefined) set.ativo = data.ativo;

  const [aulaAtualizada] = await db
    .update(aulas)
    .set(set as typeof aulas.$inferInsert)
    .where(eq(aulas.id, id))
    .returning();

  return aulaAtualizada || null;
}

/**
 * Deleta uma aula
 */
export async function deleteAula(id: string) {
  const db = getDb();
  const [aulaDeletada] = await db
    .delete(aulas)
    .where(eq(aulas.id, id))
    .returning();

  return aulaDeletada || null;
}

/**
 * Define as aulas vinculadas a um plano (substitui as atuais)
 */
export async function setAulasDoPlano(planoId: string, aulaIds: string[]) {
  const db = getDb();
  await db.delete(planosAulas).where(eq(planosAulas.planoId, planoId));

  if (aulaIds.length === 0) return;

  await db.insert(planosAulas).values(
    aulaIds.map((aulaId) => ({
      planoId,
      aulaId,
    }))
  );
}
