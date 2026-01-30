"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import {
  listarPlanosService,
  buscarPlanoService,
  criarPlanoService,
  atualizarPlanoService,
  deletarPlanoService,
} from "@/lib/services/planos";
import { planoSchema, planoUpdateSchema } from "@/schemas/planos";

/**
 * Lista todos os planos
 */
export async function listarPlanos() {
  await requireAuth();
  return await listarPlanosService();
}

/**
 * Busca um plano por ID
 */
export async function buscarPlano(id: string) {
  await requireAuth();
  return await buscarPlanoService(id);
}

/**
 * Cria um novo plano
 */
export async function criarPlano(formData: FormData) {
  await requireAuth();

  const rawData = {
    nome: formData.get("nome") as string,
    tipo: formData.get("tipo") as "INDIVIDUAL" | "COLETIVO",
    valor: formData.get("valor") as string,
    qtdDias: formData.get("qtdDias")
      ? parseInt(formData.get("qtdDias") as string)
      : undefined,
    ativo: formData.get("ativo") === "true" || formData.get("ativo") === "on",
  };

  const validated = planoSchema.parse(rawData);

  try {
    const novoPlano = await criarPlanoService(validated);

    revalidatePath("/planos");
    return { success: true, data: novoPlano };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar plano",
    };
  }
}

/**
 * Atualiza um plano
 */
export async function atualizarPlano(id: string, formData: FormData) {
  await requireAuth();

  if (!id) {
    return { success: false, error: "ID do plano é obrigatório" };
  }

  const rawData: Record<string, unknown> = {};
  const nome = formData.get("nome");
  const tipo = formData.get("tipo");
  const valor = formData.get("valor");
  const qtdDias = formData.get("qtdDias");
  const ativo = formData.get("ativo");

  if (nome) rawData.nome = nome as string;
  if (tipo) rawData.tipo = tipo as "INDIVIDUAL" | "COLETIVO";
  if (valor) rawData.valor = valor as string;
  if (qtdDias) rawData.qtdDias = parseInt(qtdDias as string);
  if (ativo !== null) {
    rawData.ativo = ativo === "true" || ativo === "on";
  }

  const validated = planoUpdateSchema.parse(rawData);

  try {
    const planoAtualizado = await atualizarPlanoService(id, validated);

    revalidatePath("/planos");
    revalidatePath(`/planos/${id}/editar`);
    return { success: true, data: planoAtualizado };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues.map((e) => e.message).join(", "),
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao atualizar plano",
    };
  }
}

/**
 * Deleta um plano
 */
export async function deletarPlano(id: string) {
  await requireAuth();

  try {
    await deletarPlanoService(id);
    revalidatePath("/planos");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao deletar plano",
    };
  }
}
