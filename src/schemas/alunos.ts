import { z } from "zod";

/**
 * Schema de validação para aluno
 */
export const alunoSchema = z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    telefone: z
        .string()
        .min(10, "Telefone deve ter pelo menos 10 dígitos")
        .regex(/^\d+$/, "Telefone deve conter apenas números"),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
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
