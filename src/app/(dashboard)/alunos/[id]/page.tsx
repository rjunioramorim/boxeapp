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
import { MatriculaCard } from "@/components/alunos/matricula-card";

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
                <MatriculaCard alunoId={id} matricula={matriculaAtiva} />

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
