import { Suspense } from "react";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { PagamentosWrapper } from "@/components/pagamentos/pagamentos-wrapper";
import { listarPagamentos } from "@/actions/pagamentos";
import { format } from "date-fns";

export const metadata = {
    title: "Pagamentos | Boxeapp",
    description: "Gestão de mensalidades e recebimentos.",
};

export default async function PagamentosPage({
    searchParams,
}: {
    searchParams: Promise<{
        alunoNome?: string;
        status?: any;
        mes?: string;
    }>;
}) {
    const params = await searchParams;
    const status = params.status || "PENDENTE";

    // Se não passar mês, assume o atual
    const mesParaListar = params.mes || format(new Date(), "yyyy-MM");

    const pagamentos = await listarPagamentos({
        ...params,
        mes: mesParaListar,
        status: status === "todos" ? undefined : status as any,
    });

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
                    <p className="text-muted-foreground">
                        Acompanhe e confirme os recebimentos das mensalidades.
                    </p>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent sm:border sm:shadow-sm sm:bg-card">
                <CardHeader className="px-0 sm:px-6">
                    <CardTitle>Fluxo de Caixa</CardTitle>
                    <CardDescription>
                        Controle de mensalidades por aluno e período.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                    <Suspense fallback={<div className="h-64 flex items-center justify-center">Carregando pagamentos...</div>}>
                        <PagamentosWrapper pagamentos={pagamentos} />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
