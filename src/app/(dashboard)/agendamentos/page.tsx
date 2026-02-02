import { Suspense } from "react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { formatarDataDB } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgendamentoList } from "@/components/agendamentos/agendamento-list";
import { listarAgendamentosDia, listarAlunosAtivos } from "@/actions/agendamentos";
import { listarAulas } from "@/actions/aulas";
import { DatePicker } from "@/components/agendamentos/date-picker";
import { AddAlunoDialog } from "@/components/agendamentos/add-aluno-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
    title: "Agendamentos | Boxeapp",
    description: "Controle de presença e agenda de aulas.",
};

export default async function AgendamentosPage({
    searchParams,
}: {
    searchParams: Promise<{ data?: string }>;
}) {
    const params = await searchParams;
    const dataSelecionadaStr = params.data || format(new Date(), "yyyy-MM-dd");

    // Usar parseISO para evitar problemas de fuso horário ao ler strings YYYY-MM-DD
    const dataSelecionada = parseISO(dataSelecionadaStr);

    const [agendamentos, alunos, aulas] = await Promise.all([
        listarAgendamentosDia(dataSelecionadaStr),
        listarAlunosAtivos(),
        listarAulas(),
    ]);

    const prevDay = format(subDays(dataSelecionada, 1), "yyyy-MM-dd");
    const nextDay = format(addDays(dataSelecionada, 1), "yyyy-MM-dd");

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Presença</h1>
                    <p className="text-muted-foreground">
                        Controle a frequência dos alunos nas aulas.
                    </p>
                </div>
                <AddAlunoDialog
                    dataSelecionada={dataSelecionada}
                    alunos={alunos}
                    aulas={aulas}
                />
            </div>

            {/* Seletor de Data Mobile/Compacto */}
            <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm sticky top-0 md:relative z-20">
                <Button asChild variant="ghost" size="icon" className="h-12 w-12">
                    <Link href={`/agendamentos?data=${prevDay}`}>
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                </Button>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-primary uppercase tracking-tighter">
                        {formatarDataDB(dataSelecionada, "EEEE")}
                    </span>
                    <DatePicker date={dataSelecionada} />
                </div>

                <Button asChild variant="ghost" size="icon" className="h-12 w-12">
                    <Link href={`/agendamentos?data=${nextDay}`}>
                        <ChevronRight className="h-6 w-6" />
                    </Link>
                </Button>
            </div>

            <div className="mt-8">
                <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando chamada...</div>}>
                    <AgendamentoList agendamentos={agendamentos} />
                </Suspense>
            </div>
        </div>
    );
}
