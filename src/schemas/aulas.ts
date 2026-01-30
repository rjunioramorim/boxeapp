import { z } from "zod";

/** Dias da semana: 1 = Segunda ... 7 = Domingo (conforme PRD) */
const diasSemanaSchema = z
  .array(z.number().int().min(1).max(7))
  .min(1, "Selecione pelo menos um dia da semana");

/**
 * Schema de validação para criar/atualizar aula
 * horario: string "HH:mm"
 */
export const aulaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  diasSemana: diasSemanaSchema,
  horario: z
    .string()
    .min(1, "Horário é obrigatório")
    .regex(/^\d{1,2}:\d{2}(:\d{2})?$/, "Use o formato HH:mm"),
  duracaoMinutos: z
    .number()
    .int("Duração deve ser um número inteiro")
    .min(1, "Duração mínima é 1 minuto")
    .max(480, "Duração máxima é 480 minutos (8h)"),
  capacidadeMaxima: z
    .number()
    .int("Capacidade deve ser um número inteiro")
    .min(1, "Capacidade mínima é 1"),
  ativo: z.boolean().optional(),
});

export const aulaUpdateSchema = aulaSchema.partial();

export type AulaFormValues = z.infer<typeof aulaSchema>;
export type AulaUpdateValues = z.infer<typeof aulaUpdateSchema>;
