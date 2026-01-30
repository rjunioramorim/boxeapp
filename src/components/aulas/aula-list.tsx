"use client";

import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { aulas } from "@/db/schema";

type Aula = typeof aulas.$inferSelect;

const DIAS_NOMES: Record<number, string> = {
    1: "Seg",
    2: "Ter",
    3: "Qua",
    4: "Qui",
    5: "Sex",
    6: "Sáb",
    7: "Dom",
};

interface AulaListProps {
    aulas: Aula[];
    onDelete: (id: string) => void;
}

export function AulaList({ aulas, onDelete }: AulaListProps) {
    const formatDias = (dias: number[]) => {
        return dias.map((d) => DIAS_NOMES[d]).join(", ");
    };

    if (aulas.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-md border border-dashed py-10">
                <p className="text-sm text-muted-foreground">Nenhuma aula cadastrada.</p>
                <Button asChild variant="link" className="mt-2">
                    <Link href="/aulas/novo">Cadastrar primeira aula</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: Cards */}
            <div className="grid gap-4 md:hidden">
                {aulas.map((aula) => (
                    <Card key={aula.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{aula.nome}</CardTitle>
                                <Badge variant={aula.ativo ? "default" : "secondary"}>
                                    {aula.ativo ? "Ativa" : "Inativa"}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Horário:</span>{" "}
                                    <span className="font-medium">{aula.horario.slice(0, 5)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Duração:</span>{" "}
                                    <span className="font-medium">{aula.duracaoMinutos} min</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Dias:</span>{" "}
                                    <span className="font-medium">{formatDias(aula.diasSemana)}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Capacidade:</span>{" "}
                                    <span className="font-medium">{aula.capacidadeMaxima}</span>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 min-h-[44px] touch-manipulation"
                                >
                                    <Link href={`/aulas/${aula.id}/editar`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(aula.id)}
                                    className="flex-1 min-h-[44px] touch-manipulation text-destructive border-destructive/20 hover:bg-destructive/10"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Dias</TableHead>
                            <TableHead>Horário</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Capacidade</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {aulas.map((aula) => (
                            <TableRow key={aula.id}>
                                <TableCell className="font-medium">{aula.nome}</TableCell>
                                <TableCell>{formatDias(aula.diasSemana)}</TableCell>
                                <TableCell>{aula.horario.slice(0, 5)}</TableCell>
                                <TableCell>{aula.duracaoMinutos} min</TableCell>
                                <TableCell>{aula.capacidadeMaxima}</TableCell>
                                <TableCell>
                                    <Badge variant={aula.ativo ? "default" : "secondary"}>
                                        {aula.ativo ? "Ativa" : "Inativa"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/aulas/${aula.id}/editar`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(aula.id)}
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
