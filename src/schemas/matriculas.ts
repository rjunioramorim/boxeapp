import { z } from "zod";

/**
 * Schema para aula dentro da matrícula
 */
export const matriculaAulaSchema = z.object({
    aulaId: z.string().uuid("Aula inválida"),
    diasSemana: z.array(z.number().min(1).max(7)).min(1, "Selecione pelo menos um dia"),
    horario: z
        .string()
        .min(1, "Horário é obrigatório")
        .regex(/^\d{1,2}:\d{2}$/, "Formato inválido (HH:mm)"),
});

/**
 * Schema de validação para matrícula completa
 */
export const matriculaCompletaSchema = z.object({
    alunoId: z.string().uuid("Aluno inválido"),
    planoId: z.string().uuid("Plano inválido"),
    diaVencimento: z.number().int().min(1).max(31),
    dataInicio: z.date({
        message: "Data de início é obrigatória",
    }),
    aulas: z.array(matriculaAulaSchema).min(1, "Selecione pelo menos uma aula"),
});

/**
 * Tipos inferidos
 */
export type MatriculaCompletaValues = z.infer<typeof matriculaCompletaSchema>;
export type MatriculaAulaValues = z.infer<typeof matriculaAulaSchema>;
