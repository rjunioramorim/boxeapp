import { Suspense } from "react";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgendamentoList } from "@/components/agendamentos/agendamento-list";
import { listarAgendamentosDia } from "@/actions/agendamentos";
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
    const dataSelecionada = new Date(dataSelecionadaStr);

    const agendamentos = await listarAgendamentosDia(dataSelecionadaStr);

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
                <Button disabled className="min-h-[44px] touch-manipulation">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Aluno
                </Button>
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
                        {format(dataSelecionada, "EEEE", { locale: ptBR })}
                    </span>
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-lg font-black tracking-tight">
                            {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
                        </span>
                    </div>
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
