"use client";

import Link from "next/link";
import { Search, MoreHorizontal, User, Phone, Mail, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { alunos } from "@/db/schema";

type Aluno = typeof alunos.$inferSelect;

interface AlunoListProps {
    alunos: Aluno[];
    onDelete?: (id: string) => void;
}

const statusMap = {
    ATIVO: { label: "Ativo", variant: "default" as const },
    INATIVO: { label: "Inativo", variant: "secondary" as const },
    SUSPENSO: { label: "Suspenso", variant: "destructive" as const },
};

export function AlunoList({ alunos, onDelete }: AlunoListProps) {
    if (alunos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
                <p className="text-sm text-muted-foreground">
                    Comece cadastrando um novo aluno no botão acima.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Mobile: Cards */}
            <div className="grid gap-4 md:hidden">
                {alunos.map((aluno) => {
                    const status = statusMap[aluno.status] || { label: aluno.status, variant: "outline" };
                    return (
                        <Link key={aluno.id} href={`/alunos/${aluno.id}`}>
                            <Card className="active:bg-accent/50 transition-colors">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">{aluno.nome}</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" /> {aluno.telefone}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {alunos.map((aluno) => {
                            const status = statusMap[aluno.status] || { label: aluno.status, variant: "outline" };
                            return (
                                <TableRow key={aluno.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/alunos/${aluno.id}`} className="hover:underline">
                                            {aluno.nome}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{aluno.telefone}</TableCell>
                                    <TableCell>{aluno.email || "-"}</TableCell>
                                    <TableCell>
                                        <Badge variant={status.variant}>{status.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/alunos/${aluno.id}`}>Visualizar Perfil</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/alunos/${aluno.id}/editar`}>Editar Aluno</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {onDelete && (
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => onDelete(aluno.id)}
                                                    >
                                                        Excluir Aluno
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
