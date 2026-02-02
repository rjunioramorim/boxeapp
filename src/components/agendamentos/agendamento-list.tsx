"use client";

import { useTransition, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Users,
    Clock,
    CheckCircle2,
    Circle,
    XCircle,
    MoreVertical,
    Trash2
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
import { marcarPresenca } from "@/actions/agendamentos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Agendamento {
    id: string;
    horario: string;
    status: "AGENDADO" | "PRESENTE" | "AUSENTE" | "CANCELADO";
    aula: {
        id: string;
        nome: string;
    };
    aluno: {
        id: string;
        nome: string;
    };
}

interface AgendamentoListProps {
    agendamentos: Agendamento[];
}

export function AgendamentoList({ agendamentos }: AgendamentoListProps) {
    const [isPending, startTransition] = useTransition();
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        id: string;
        nome: string;
        status: "PRESENTE" | "AUSENTE" | "AGENDADO" | "REMOVER";
    }>({ open: false, id: "", nome: "", status: "AGENDADO" });

    // Agrupar por Aula e Horário
    const grupos = agendamentos.reduce((acc, current) => {
        const key = `${current.aula.nome}-${current.horario}`;
        if (!acc[key]) {
            acc[key] = {
                aulaNome: current.aula.nome,
                horario: current.horario,
                alunos: [],
            };
        }
        acc[key].alunos.push(current);
        return acc;
    }, {} as Record<string, { aulaNome: string; horario: string; alunos: Agendamento[] }>);

    const handleStatusChange = (id: string, newStatus: "PRESENTE" | "AUSENTE" | "AGENDADO" | "REMOVER") => {
        if (newStatus === "REMOVER") {
            // Lógica de remoção seria aqui. Por enquanto vamos focar no que foi pedido.
            // O usuário pediu "exibir dialog confirmando presença ou falta do aluno"
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

    if (agendamentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border-2 border-dashed rounded-xl">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Sem aulas agendadas</h3>
                <p className="text-muted-foreground mt-2">
                    Não há alunos previstos para treinar nesta data.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {Object.values(grupos).map((grupo) => (
                <section key={`${grupo.aulaNome}-${grupo.horario}`} className="space-y-4">
                    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-2 border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">{grupo.aulaNome}</h2>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Às {grupo.horario.slice(0, 5)} • {grupo.alunos.length} alunos
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                {grupo.alunos.filter(a => a.status === 'PRESENTE').length} P
                            </Badge>
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                                {grupo.alunos.filter(a => a.status === 'AUSENTE').length} F
                            </Badge>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {grupo.alunos.map((aluno) => (
                            <Card
                                key={aluno.id}
                                className={cn(
                                    "transition-all duration-200",
                                    aluno.status === 'PRESENTE' ? "bg-green-500/5 border-green-200" :
                                        aluno.status === 'AUSENTE' ? "bg-red-500/5 border-red-200" : ""
                                )}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            aluno.status === 'PRESENTE' ? "bg-green-500/20" :
                                                aluno.status === 'AUSENTE' ? "bg-red-500/20" : "bg-muted"
                                        )}>
                                            {aluno.status === 'PRESENTE' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                                                aluno.status === 'AUSENTE' ? <XCircle className="h-4 w-4 text-red-600" /> :
                                                    <Circle className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                        <span className="font-semibold truncate">{aluno.aluno.nome}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 text-green-600 hover:bg-green-100",
                                                aluno.status === 'PRESENTE' && "bg-green-100"
                                            )}
                                            onClick={() => openConfirm(aluno.id, aluno.aluno.nome, 'PRESENTE')}
                                            disabled={isPending}
                                        >
                                            <CheckCircle2 className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 text-red-600 hover:bg-red-100",
                                                aluno.status === 'AUSENTE' && "bg-red-100"
                                            )}
                                            onClick={() => openConfirm(aluno.id, aluno.aluno.nome, 'AUSENTE')}
                                            disabled={isPending}
                                        >
                                            <XCircle className="h-5 w-5" />
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleStatusChange(aluno.id, 'AGENDADO')}>
                                                    Resetar Status
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => openConfirm(aluno.id, aluno.aluno.nome, 'REMOVER')}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remover Aluno
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            ))}

            <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Ação</DialogTitle>
                        <DialogDescription>
                            Deseja confirmar a {confirmDialog.status === 'PRESENTE' ? 'presença' :
                                confirmDialog.status === 'AUSENTE' ? 'falta' : 'remoção'}
                            de <strong>{confirmDialog.nome}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>
                            Cancelar
                        </Button>
                        <Button
                            variant={confirmDialog.status === 'AUSENTE' || confirmDialog.status === 'REMOVER' ? 'destructive' : 'default'}
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
