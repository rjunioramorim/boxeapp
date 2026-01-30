import {
    getRelatorioPresencaDia,
    updateStatusPresenca,
    agendarManual,
} from "@/db/queries/agendamentos";

/**
 * Service para listar todos os agendamentos de um dia específico
 */
export async function listarAgendamentosDiaService(data: Date) {
    return await getRelatorioPresencaDia(data);
}

/**
 * Service para marcar presença ou falta
 */
export async function marcarPresencaService(id: string, presenca: "PRESENTE" | "AUSENTE" | "AGENDADO") {
    if (!id) throw new Error("ID do agendamento é obrigatório");
    return await updateStatusPresenca(id, presenca);
}

/**
 * Service para agendar aula manualmente
 */
export async function agendarManualService(data: {
    alunoId: string;
    aulaId: string;
    matriculaId: string;
    data: Date;
    horario: string;
}) {
    return await agendarManual(data);
}
