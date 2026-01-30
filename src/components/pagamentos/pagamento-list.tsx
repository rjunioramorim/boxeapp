"use client";

import { useState } from "react";
import { formatarDataDB } from "@/lib/utils";
import {
    CreditCard,
    Calendar,
    User,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreHorizontal
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Pagamento {
    id: string;
    valorEsperado: string;
    valorPago: string | null;
    mesReferencia: Date;
    dataVencimento: Date;
    dataPagamento: Date | null;
    status: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO";
    aluno: {
        id: string;
        nome: string;
    };
}

interface PagamentoListProps {
    pagamentos: Pagamento[];
    onConfirm: (pagamento: Pagamento) => void;
}

const statusMap = {
    PENDENTE: { label: "Pendente", variant: "outline" as const, icon: Clock },
    PAGO: { label: "Pago", variant: "default" as const, icon: CheckCircle2 },
    ATRASADO: { label: "Atrasado", variant: "destructive" as const, icon: AlertCircle },
    CANCELADO: { label: "Cancelado", variant: "secondary" as const, icon: Clock },
};

export function PagamentoList({ pagamentos, onConfirm }: PagamentoListProps) {
    if (pagamentos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum pagamento encontrado</h3>
                <p className="text-sm text-muted-foreground">
                    Nenhum registro de mensalidade para os filtros selecionados.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: Cards */}
            <div className="grid gap-4 md:hidden">
                {pagamentos.map((pag) => {
                    const status = statusMap[pag.status] || { label: pag.status, variant: "outline", icon: Clock };
                    const StatusIcon = status.icon;

                    return (
                        <Card key={pag.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: pag.status === 'PAGO' ? 'hsl(var(--primary))' : pag.status === 'ATRASADO' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))' }}>
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-lg">{pag.aluno.nome}</span>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Ref: {formatarDataDB(pag.mesReferencia, "MMMM/yyyy")}
                                        </span>
                                    </div>
                                    <Badge variant={status.variant} className="flex items-center gap-1">
                                        <StatusIcon className="h-3 w-3" />
                                        {status.label}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Valor</div>
                                        <div className="text-xl font-black">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(parseFloat(pag.valorEsperado))}
                                        </div>
                                    </div>

                                    {pag.status !== "PAGO" && pag.status !== "CANCELADO" ? (
                                        <Button
                                            onClick={() => onConfirm(pag)}
                                            className="min-h-[44px] touch-manipulation font-bold"
                                        >
                                            Confirmar
                                        </Button>
                                    ) : pag.dataPagamento ? (
                                        <div className="text-right text-xs text-muted-foreground">
                                            Pago em: {formatarDataDB(pag.dataPagamento, "dd/MM/yyyy")}
                                        </div>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-hidden rounded-md border text-base">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aluno</TableHead>
                            <TableHead>Referência</TableHead>
                            <TableHead>Vencimento</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pagamentos.map((pag) => {
                            const status = statusMap[pag.status] || { label: pag.status, variant: "outline", icon: Clock };
                            return (
                                <TableRow key={pag.id}>
                                    <TableCell className="font-medium">{pag.aluno.nome}</TableCell>
                                    <TableCell className="capitalize">
                                        {formatarDataDB(pag.mesReferencia, "MMMM/yyyy")}
                                    </TableCell>
                                    <TableCell>{formatarDataDB(pag.dataVencimento, "dd/MM/yyyy")}</TableCell>
                                    <TableCell className="font-bold">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(parseFloat(pag.valorEsperado))}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {pag.status !== "PAGO" && pag.status !== "CANCELADO" ? (
                                            <Button variant="outline" size="sm" onClick={() => onConfirm(pag)}>
                                                Confirmar
                                            </Button>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                    <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        Estornar Pagamento
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
