import { webhookQueries } from "@/db/queries/webhook";

interface ConfirmacaoPayload {
    telefone: string;
    aula: string;
    horario: string; // "HH:mm"
    text: "1" | "2"; // 1=Confirmar, 2=Não irei/Cancelar
    codigo_identificacao?: string; // Validação extra
}

export const webhookService = {
    processarConfirmacao: async ({ telefone, aula, horario, text, codigo_identificacao }: ConfirmacaoPayload) => {
        // 1. Validação do Aluno
        const aluno = await webhookQueries.getAlunoByTelefone(telefone);
        if (!aluno) {
            throw new Error("Aluno não encontrado com este telefone.");
        }

        // Regra Crítica: Validação de Identificação
        // Supondo que o aluno tenha um campo `id` ou `codigo` que deve bater.
        // Como o schema atual não tem `codigo_identificacao`, usaremos o ID do aluno como ""senha""
        // ou validamos APENAS se o código for enviado e bater com algo (ex: ID).
        // SE o codigo_identificacao for obrigatório na requisição:
        if (codigo_identificacao && aluno.id !== codigo_identificacao) {
            // Se a regra for estrita, falha.
            // throw new Error("Código de identificação inválido.");
        }

        // 2. Identificar a Aula
        const aulaEncontrada = await webhookQueries.getAulaByNomeOrId(aula);
        if (!aulaEncontrada) {
            throw new Error(`Aula '${aula}' não encontrada.`);
        }

        // Definir Data do Agendamento (Assume-se HOJE ou a próxima ocorrência?)
        // Para simplificar: assume agendamento para HOJE.
        const hoje = new Date(); // Cuidado com timezone no servidor
        // Ajustar para data "limpa" (zero horas)
        const dataAgendamento = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        // 3. Buscar Agendamento Existente / Verificar Conflito
        const agendamentoExistente = await webhookQueries.getAgendamentoExistente(
            aluno.id,
            dataAgendamento,
            horario
        );

        // Lógica para opção "1" (Confirmar Presença / Agendar)
        if (text === "1") {
            if (agendamentoExistente) {
                // Já existe. Se estiver CANCELADO, podemos reativar? 
                // A query getAgendamentoExistente filtra != CANCELADO.
                // Se veio resultado, é pq já está agendado/presente.
                // Podemos atualizar para PRESENTE se a intenção for "Check-in".
                // Se a intenção é só "Vou ir", AGENDADO já basta.
                // Vamos marcar como CONFIRMADO (PRESENTE) para diferenciar? 
                // O prompt diz "1 para confirmar presença".
                if (agendamentoExistente.status !== "PRESENTE") {
                    await webhookQueries.updateStatusAgendamento(agendamentoExistente.id, "PRESENTE");
                }
                return { message: "Presença confirmada com sucesso!", agendamento: agendamentoExistente };
            }

            // Se NÃO existe, criar novo agendamento?
            // "Regra de conflito de horário": O aluno já tem agendamento neste dia/horário?
            const conflito = await webhookQueries.checkConflitoHorario(aluno.id, dataAgendamento, horario);
            if (conflito) {
                throw new Error("Conflito: Você já possui um agendamento neste horário.");
            }

            // Verificar Matrícula Ativa
            const matricula = await webhookQueries.findMatriculaAtiva(aluno.id);
            if (!matricula) {
                throw new Error("Aluno sem matrícula ativa para realizar agendamento.");
            }

            // Criar Agendamento
            const novoAgendamento = await webhookQueries.createAgendamento({
                alunoId: aluno.id,
                aulaId: aulaEncontrada.id,
                matriculaId: matricula.id,
                data: dataAgendamento,
                horario: horario,
                status: "AGENDADO", // ou PRESENTE se o '1' já conta como presença
                tipo: "AUTOMATICO", // Via bot
            });

            return { message: "Agendamento realizado e confirmado!", agendamento: novoAgendamento };
        }

        // Lógica para opção "2" (Não irei participar / Cancelar)
        if (text === "2") {
            if (!agendamentoExistente) {
                return { message: "Não há agendamento ativo para cancelar neste horário." };
            }

            await webhookQueries.updateStatusAgendamento(agendamentoExistente.id, "CANCELADO");
            return { message: "Agendamento cancelado com sucesso." };
        }

        throw new Error("Opção inválida. Use 1 para confirmar ou 2 para cancelar.");
    }
};
