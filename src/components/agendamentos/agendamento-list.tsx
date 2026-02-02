"use client";

import { useTransition, useState } from "react";
import { format, isSameDay, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Users,
    Clock,
    CheckCircle2,
    Circle,
    XCircle,
    MoreVertical,
    Trash2,
    UserPlus
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { marcarPresenca } from "@/actions/agendamentos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddAlunoDialog } from "./add-aluno-dialog";

interface Agendamento {
    id: string;
    horario: string;
    status: string;
    data: Date;
    aula: {
        id: string;
        nome: string;
    };
    aluno: {
        id: string;
        nome: string;
    };
}

interface Aula {
    id: string;
    nome: string;
    horario: string;
    diasSemana: number[];
    ativo: boolean;
}

interface Aluno {
    id: string;
    nome: string;
}

interface AgendamentoListProps {
    agendamentos: Agendamento[];
    aulas: Aula[];
    alunos: Aluno[];
    dataSelecionada: Date;
}

export function AgendamentoList({ agendamentos, aulas, alunos, dataSelecionada }: AgendamentoListProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        id: string;
        nome: string;
        status: "PRESENTE" | "AUSENTE" | "AGENDADO" | "REMOVER";
    }>({ open: false, id: "", nome: "", status: "AGENDADO" });

    // Filtrar aulas que ocorrem no dia da semana selecionado
    // Em JavaScript getDay() retorna 0 para Domingo, 1 para Segunda...
    // No banco, assumimos 1=Segunda ... 7=Domingo (será? Precisa verificar o schema ou convenção)
    // Se o schema diz "1=seg ... 7=dom", precisamos ajustar.
    // date-fns getDay(): 0|Sun, 1|Mon...
    // Ajuste: 0 (Sun) -> 7.
    const diaSemanaAtual = getDay(dataSelecionada) === 0 ? 7 : getDay(dataSelecionada);

    const aulasDoDia = aulas
        .filter(aula => aula.ativo && aula.diasSemana.includes(diaSemanaAtual))
        .sort((a, b) => a.horario.localeCompare(b.horario));

    // Agrupar agendamentos por aulaId
    // Nota: Agendamentos podem ser de aulas que não estão na lista de "aulasDoDia" (ex: aula extra ou aula desativada)
    // Mas o requisito pede "lista de aulas do dia...". Vamos focar nas aulas configuradas.
    const agendamentosMap = new Map<string, Agendamento[]>();
    agendamentos.forEach(ag => {
        // Filtrar apenas agendamentos desta data
        // Usando comparação de string ISO YYYY-MM-DD para evitar problemas de timezone (UTC vs Local)
        // dataSelecionada é Date local meia-noite (do parseISO em page.tsx) ou string YYYY-MM-DD?
        // Em page.tsx é Date. Vamos usar format() para garantir string YYYY-MM-DD
        const agDateStr = new Date(ag.data).toISOString().split('T')[0];
        const selectedDateStr = format(dataSelecionada, 'yyyy-MM-dd');

        if (agDateStr === selectedDateStr) {
            const list = agendamentosMap.get(ag.aula.id) || [];
            list.push(ag);
            agendamentosMap.set(ag.aula.id, list);
        }
    });

    const handleStatusChange = (id: string, newStatus: "PRESENTE" | "AUSENTE" | "AGENDADO" | "REMOVER") => {
        if (newStatus === "REMOVER") {
            // TODO: Implementar remoção real
            toast.error("Funcionalidade de remover ainda não implementada no backend");
            setConfirmDialog({ ...confirmDialog, open: false });
            return;
        }

        startTransition(async () => {
            const result = await marcarPresenca(id, newStatus as "PRESENTE" | "AUSENTE" | "AGENDADO") as any;
            if (result.success) {
                toast.success(`Status atualizado para ${newStatus.toLowerCase()}`);
            } else {
                toast.error(result.error || "Erro ao atualizar status");
            }
            setConfirmDialog({ ...confirmDialog, open: false });
        });
    };

    const openConfirm = (id: string, nome: string, status: "PRESENTE" | "AUSENTE" | "AGENDADO" | "REMOVER") => {
        setConfirmDialog({ open: true, id, nome, status });
    };

    if (aulasDoDia.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-xl">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Sem aulas configuradas</h3>
                <p className="text-muted-foreground mt-2">
                    Não há aulas programadas para este dia da semana.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full space-y-4">
                {aulasDoDia.map((aula) => {
                    const alunosNaAula = agendamentosMap.get(aula.id) || [];
                    const confirmados = alunosNaAula.filter(a => a.status === 'PRESENTE').length;
                    const agendados = alunosNaAula.filter(a => a.status === 'AGENDADO').length; // Ou 'não confirmados'? Assumindo status != PRESENTE e != AUSENTE
                    // Requisito: "total de alunos confirmados e não confirmados"
                    // Não confirmados = Total - Confirmados (inclui Agendados, Ausentes?)
                    // Geralmente "não confirmado" é quem ainda não veio.
                    const pendentes = alunosNaAula.length - confirmados;

                    return (
                        <AccordionItem key={aula.id} value={aula.id} className="border rounded-xl px-4 bg-card shadow-sm">
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full text-left pr-4">
                                    <div className="flex items-center gap-3 min-w-[200px]">
                                        <div className="bg-primary/10 p-2.5 rounded-lg">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base">{aula.nome}</h3>
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                {aula.horario.slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Total</span>
                                                <span className="font-bold text-foreground">{alunosNaAula.length}</span>
                                            </div>
                                            <div className="w-px h-8 bg-border" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-green-600/70">Confirmados</span>
                                                <span className="font-bold text-green-600">{confirmados}</span>
                                            </div>
                                            <div className="w-px h-8 bg-border" />
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-orange-600/70">Pendentes</span>
                                                <span className="font-bold text-orange-600">{pendentes}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        {/* Botão de Adicionar Aluno Específico para esta aula */}
                                        <AddAlunoDialog
                                            aulas={aulas} // Passamos todas, mas vamos pré-selecionar
                                            alunos={alunos}
                                            dataSelecionada={dataSelecionada}
                                            agendamentos={agendamentos}
                                            aulaPreSelecionada={aula.id}
                                        />
                                    </div>

                                    {alunosNaAula.length === 0 ? (
                                        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
                                            <Users className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">Nenhum aluno agendado para esta aula.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                            {alunosNaAula.map((ag) => (
                                                <Card
                                                    key={ag.id}
                                                    className={cn(
                                                        "transition-all duration-200",
                                                        ag.status === 'PRESENTE' ? "bg-green-500/5 border-green-200" :
                                                            ag.status === 'AUSENTE' ? "bg-red-500/5 border-red-200" : ""
                                                    )}
                                                >
                                                    <CardContent className="p-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={cn(
                                                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                                                ag.status === 'PRESENTE' ? "bg-green-500/20" :
                                                                    ag.status === 'AUSENTE' ? "bg-red-500/20" : "bg-muted"
                                                            )}>
                                                                {ag.status === 'PRESENTE' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                                                                    ag.status === 'AUSENTE' ? <XCircle className="h-4 w-4 text-red-600" /> :
                                                                        <Circle className="h-4 w-4 text-muted-foreground" />}
                                                            </div>
                                                            <span className="font-medium truncate text-sm">{ag.aluno.nome}</span>
                                                        </div>

                                                        <div className="flex items-center">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(ag.id, 'PRESENTE')}>
                                                                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Marcar Presença
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(ag.id, 'AUSENTE')}>
                                                                        <XCircle className="mr-2 h-4 w-4 text-red-600" /> Marcar Falta
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleStatusChange(ag.id, 'AGENDADO')}>
                                                                        Resetar Status
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Ação</DialogTitle>
                        <DialogDescription>
                            Deseja confirmar a ação para <strong>{confirmDialog.nome}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => handleStatusChange(confirmDialog.id, confirmDialog.status)}
                            disabled={isPending}
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
