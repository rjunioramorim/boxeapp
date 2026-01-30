import { z } from "zod";

/**
 * Schema de validação para criar/atualizar plano
 */
export const planoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  tipo: z.enum(["INDIVIDUAL", "COLETIVO"], {
    message: "Tipo deve ser INDIVIDUAL ou COLETIVO",
  }),
  valor: z
    .string()
    .min(1, "Valor é obrigatório")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Valor deve ser um número positivo"
    ),
  qtdDias: z
    .number()
    .int("Quantidade de dias deve ser um número inteiro")
    .min(1, "Quantidade de dias deve ser pelo menos 1")
    .max(31, "Quantidade de dias não pode ser maior que 31")
    .optional(),
  ativo: z.boolean().optional(),
  aulaIds: z.array(z.string().uuid()),
});

/**
 * Schema para atualização parcial de plano
 */
export const planoUpdateSchema = planoSchema.partial();

/**
 * Tipo inferido do schema de plano
 */
export type PlanoFormValues = z.infer<typeof planoSchema>;

/**
 * Tipo inferido do schema de atualização de plano
 */
export type PlanoUpdateValues = z.infer<typeof planoUpdateSchema>;
