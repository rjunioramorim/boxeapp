import Link from "next/link";
import { ArrowLeft, Edit, GraduationCap, Calendar, CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buscarAluno } from "@/actions/alunos";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const aluno = await buscarAluno(id);
    return {
        title: aluno ? `${aluno.nome} | Boxeapp` : "Aluno não encontrado",
    };
}

const statusMap = {
    ATIVO: { label: "Ativo", variant: "default" as const },
    INATIVO: { label: "Inativo", variant: "secondary" as const },
    SUSPENSO: { label: "Suspenso", variant: "destructive" as const },
};

const statusMatriculaMap = {
    ATIVA: { label: "Ativa", variant: "default" as const },
    CANCELADA: { label: "Cancelada", variant: "secondary" as const },
    SUSPENSA: { label: "Suspensa", variant: "destructive" as const },
};

export default async function AlunoPerfilPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const aluno = await buscarAluno(id);

    if (!aluno) {
        notFound();
    }

    const matriculaAtiva = aluno.matriculas?.[0];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
                        <Link href="/alunos">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{aluno.nome}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={statusMap[aluno.status]?.variant || "outline"}>
                                {statusMap[aluno.status]?.label || aluno.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{aluno.telefone}</span>
                        </div>
                    </div>
                </div>
                <Button asChild variant="outline" className="min-h-[44px]">
                    <Link href={`/alunos/${id}/editar`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Perfil
                    </Link>
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Card de Matrícula */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                Matrícula
                            </CardTitle>
                            {matriculaAtiva && (
                                <Badge variant={statusMatriculaMap[matriculaAtiva.status]?.variant || "outline"}>
                                    {statusMatriculaMap[matriculaAtiva.status]?.label || matriculaAtiva.status}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {matriculaAtiva ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plano</div>
                                    <div className="text-lg font-semibold">{matriculaAtiva.plano.nome}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Início</div>
                                        <div>{format(new Date(matriculaAtiva.dataInicio), "dd/MM/yyyy")}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground">Vencimento</div>
                                        <div>Dia {matriculaAtiva.diaVencimento}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-2">Aulas e Horários</div>
                                    <div className="space-y-2">
                                        {matriculaAtiva.matriculasAulas.map((ma: any) => (
                                            <div key={ma.id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                                                <span className="font-medium">{ma.aula.nome}</span>
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
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center bg-muted/30 rounded-lg border border-dashed">
                                <p className="text-muted-foreground mb-4">Este aluno não possui matrícula ativa.</p>
                                <Button asChild className="min-h-[44px]">
                                    <Link href={`/alunos/${id}/matricular`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Nova Matrícula
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card de Pagamentos Recentes */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Pagamentos Recentes
                        </CardTitle>
                        <CardDescription>Últimos 5 lançamentos de mensalidade.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {aluno.pagamentosRecentes && aluno.pagamentosRecentes.length > 0 ? (
                            <div className="space-y-4">
                                {aluno.pagamentosRecentes.map((pag: any) => (
                                    <div key={pag.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <div className="font-medium">
                                                {format(new Date(pag.mesReferencia), "MMMM/yyyy", { locale: ptBR })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Venc: {format(new Date(pag.dataVencimento), "dd/MM/yyyy")}
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
                </Card>

                {/* Card de Presença Recente */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Presenças Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {aluno.agendamentos && aluno.agendamentos.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {aluno.agendamentos.map((ag: any) => (
                                    <div key={ag.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div>
                                            <div className="font-semibold text-sm">{ag.aula.nome}</div>
                                            <div className="text-xs text-muted-foreground uppercase">
                                                {format(new Date(ag.data), "eeee, dd/MM", { locale: ptBR })}
                                            </div>
                                        </div>
                                        <Badge variant={ag.status === "PRESENTE" ? "default" : ag.status === "AUSENTE" ? "destructive" : "outline"}>
                                            {ag.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-muted-foreground text-sm">Nenhum registro de presença.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
