"use client";

import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarDataDB } from "@/lib/utils";
import { NovoPagamentoDialog } from "@/components/pagamentos/novo-pagamento-dialog";

interface AlunoPagamentosCardProps {
    aluno: any;
}

export function AlunoPagamentosCard({ aluno }: AlunoPagamentosCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const matriculaAtiva = aluno.matriculas?.find((m: any) => m.status === "ATIVA") || aluno.matriculas?.[0];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Pagamentos Recentes
                    </CardTitle>
                    <CardDescription>Últimos 5 lançamentos de mensalidade.</CardDescription>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsDialogOpen(true)}
                    className="h-8 gap-1"
                >
                    <Plus className="h-4 w-4" />
                    Novo
                </Button>
            </CardHeader>
            <CardContent>
                {aluno.pagamentosRecentes && aluno.pagamentosRecentes.length > 0 ? (
                    <div className="space-y-4">
                        {aluno.pagamentosRecentes.map((pag: any) => (
                            <div key={pag.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-medium">
                                        {formatarDataDB(pag.mesReferencia, "MMMM/yyyy")}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Venc: {formatarDataDB(pag.dataVencimento, "dd/MM/yyyy")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-sm">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(parseFloat(pag.valorEsperado))}
                                    </div>
                                    <Badge variant={pag.status === "PAGO" ? "default" : "outline"} className="text-[10px]">
                                        {pag.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-muted-foreground text-sm">Nenhum pagamento registrado.</p>
                )}
            </CardContent>

            <NovoPagamentoDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                aluno={{
                    id: aluno.id,
                    nome: aluno.nome,
                    matriculaAtiva: matriculaAtiva
                }}
            />
        </Card>
    );
}
