import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { webhookService } from "@/services/webhook";



// Schema de validação
const confirmacaoSchema = z.object({
    telefone: z.string().min(8, "Telefone inválido"),
    aula: z.string().min(1, "Aula é obrigatória"),
    horario: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido (HH:mm)"),
    text: z.enum(["1", "2"], { message: "Status deve ser 1 ou 2" }),
    codigo_identificacao: z.string().optional(), // Opcional no schema, mas validado no service se enviado
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validação Zod
        const result = confirmacaoSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Dados inválidos", details: result.error.format() },
                { status: 400 }
            );
        }

        const { telefone, aula, horario, text, codigo_identificacao } = result.data;

        // Chamada ao Service
        const response = await webhookService.processarConfirmacao({
            telefone,
            aula,
            horario,
            text,
            codigo_identificacao,
        });

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error("Erro no webhook de confirmação:", error);
        const message = error instanceof Error ? error.message : "Erro interno no servidor";
        return NextResponse.json({ error: message }, { status: 400 }); // Bad Request para erros de regra de negócio
    }
}
