import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CreditCard, User, Calendar, Receipt, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatarDataDB } from "@/lib/utils";
import { buscarPagamentoService } from "@/services/pagamentos";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const pag = await buscarPagamentoService(id);
        return {
            title: `Detalhes do Pagamento - ${pag.matricula.aluno.nome} | Boxeapp`,
        };
    } catch {
        return { title: "Pagamento não encontrado" };
    }
}

const statusMap = {
    PENDENTE: { label: "Pendente", variant: "outline" as const, icon: Clock },
    PAGO: { label: "Pago", variant: "default" as const, icon: CheckCircle2 },
    ATRASADO: { label: "Atrasado", variant: "destructive" as const, icon: AlertCircle },
    CANCELADO: { label: "Cancelado", variant: "secondary" as const, icon: Clock },
};

export default async function PagamentoDetalhesPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let pagamento;
    try {
        pagamento = await buscarPagamentoService(id);
    } catch (error) {
        notFound();
    }

    const status = statusMap[pagamento.status as keyof typeof statusMap] || { label: pagamento.status, variant: "outline", icon: Clock };
    const StatusIcon = status.icon;

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="min-h-[44px]">
                    <Link href="/pagamentos">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Detalhes do Pagamento</h1>
                    <p className="text-muted-foreground">Informações completas do lançamento.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Resumo do Status */}
                <Card className="md:col-span-2 border-l-4" style={{ borderLeftColor: pagamento.status === 'PAGO' ? 'hsl(var(--primary))' : pagamento.status === 'ATRASADO' ? 'hsl(var(--destructive))' : 'hsl(var(--muted-foreground))' }}>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${pagamento.status === 'PAGO' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <StatusIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status Atual</div>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        {status.label}
                                        <Badge variant={status.variant}>{pagamento.status}</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Valor Esperado</div>
                                <div className="text-3xl font-black">
                                    {new Intl.NumberFormat("pt-BR", {
                                        style: "currency",
                                        currency: "BRL",
                                    }).format(parseFloat(pagamento.valorEsperado))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Informações do Aluno e Matrícula */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Dados do Aluno
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Aluno:</span>
                            <Link href={`/alunos/${pagamento.matricula.aluno.id}`} className="font-bold hover:underline">
                                {pagamento.matricula.aluno.nome}
                            </Link>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Plano:</span>
                            <span className="font-medium">{pagamento.matricula.plano.nome}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Valor do Plano:</span>
                            <span className="font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(parseFloat(pagamento.matricula.plano.valor))}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Detalhes do Lançamento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Dados do Lançamento
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Mês de Referência:</span>
                            <span className="font-medium capitalize">
                                {formatarDataDB(pagamento.mesReferencia, "MMMM/yyyy")}
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-muted-foreground">Data de Vencimento:</span>
                            <span className="font-medium">
                                {formatarDataDB(pagamento.dataVencimento, "dd/MM/yyyy")}
                            </span>
                        </div>
                        {pagamento.status === "PAGO" && (
                            <>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Valor Pago:</span>
                                    <span className="font-bold text-primary">
                                        {new Intl.NumberFormat("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        }).format(parseFloat(pagamento.valorPago || "0"))}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-muted-foreground">Data do Pagamento:</span>
                                    <span className="font-medium">
                                        {formatarDataDB(pagamento.dataPagamento, "dd/MM/yyyy")}
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Observações */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Observações
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pagamento.observacoes ? (
                            <p className="text-sm bg-muted p-4 rounded-md italic">
                                "{pagamento.observacoes}"
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma observação registrada para este pagamento.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
