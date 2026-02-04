import { z } from "zod";

/**
 * Schema de validação para aluno
 */
export const alunoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    telefone: z
        .string()
        .refine(
            (value) => value.replace(/\D/g, "").length >= 10,
            "Telefone deve ter pelo menos 10 dígitos"
        )
        .transform((value) => value.replace(/\D/g, "")),
    email: z.string().nullish(),
    status: z.enum(["ATIVO", "INATIVO", "SUSPENSO"]).default("ATIVO"),
});

/**
 * Schema para atualização de aluno
 */
export const alunoUpdateSchema = alunoSchema.partial();

/**
 * Tipos inferidos
 */
export type AlunoFormValues = z.infer<typeof alunoSchema>;
export type AlunoUpdateValues = z.infer<typeof alunoUpdateSchema>;
