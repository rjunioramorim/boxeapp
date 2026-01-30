"use client";

import { useState } from "react";
import { format } from "date-fns";
import { GraduationCap, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditarHorariosDialog } from "./editar-horarios-dialog";
import Link from "next/link";

interface MatriculaCardProps {
    alunoId: string;
    matricula: any;
}

const statusMatriculaMap = {
    ATIVA: { label: "Ativa", variant: "default" as const },
    CANCELADA: { label: "Cancelada", variant: "secondary" as const },
    SUSPENSA: { label: "Suspensa", variant: "destructive" as const },
};

export function MatriculaCard({ alunoId, matricula }: MatriculaCardProps) {
    const [showEditarHorarios, setShowEditarHorarios] = useState(false);

    if (!matricula) {
        return (
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Matrícula
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-muted/30 rounded-lg border border-dashed">
                        <p className="text-muted-foreground mb-4">Este aluno não possui matrícula ativa.</p>
                        <Button asChild className="min-h-[44px]">
                            <Link href={`/alunos/${alunoId}/matricular`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Matrícula
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Matrícula
                        </CardTitle>
                        <Badge variant={statusMatriculaMap[matricula.status as keyof typeof statusMatriculaMap]?.variant || "outline"}>
                            {statusMatriculaMap[matricula.status as keyof typeof statusMatriculaMap]?.label || matricula.status}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plano</div>
                                <div className="text-lg font-semibold">{matricula.plano.nome}</div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-2 text-xs"
                                onClick={() => setShowEditarHorarios(true)}
                            >
                                <Edit2 className="h-3 w-3 mr-1" />
                                Alterar Horários
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Início</div>
                                <div>{format(new Date(matricula.dataInicio), "dd/MM/yyyy")}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground">Vencimento</div>
                                <div>Dia {matricula.diaVencimento}</div>
                            </div>
                        </div>

                        <div>
                            <div className="text-sm font-medium text-muted-foreground mb-2">Aulas e Horários</div>
                            <div className="space-y-2">
                                {matricula.matriculasAulas.map((ma: any) => (
                                    <div key={ma.id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                                        <span className="font-medium text-sm">{ma.aula.nome}</span>
                                        <div className="text-right">
                                            <div className="text-xs font-bold">{ma.horario.slice(0, 5)}</div>
                                            <div className="flex gap-1 justify-end">
                                                {ma.diasSemana.map((dia: number) => (
                                                    <span key={dia} className="text-[10px] uppercase font-bold text-muted-foreground">
                                                        {["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][dia]}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {showEditarHorarios && (
                <EditarHorariosDialog
                    matricula={matricula}
                    onOpenChange={setShowEditarHorarios}
                />
            )}
        </>
    );
}
