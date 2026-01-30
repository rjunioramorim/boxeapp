import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlunoListWrapper } from "@/components/alunos/aluno-list-wrapper";
import { listarAlunos } from "@/actions/alunos";

export const metadata = {
    title: "Alunos | Boxeapp",
    description: "Gerencie os alunos da academia.",
};

export default async function AlunosPage({
    searchParams,
}: {
    searchParams: Promise<{ nome?: string; status?: any }>;
}) {
    const params = await searchParams;
    const alunos = await listarAlunos(params);

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Alunos</h1>
                    <p className="text-muted-foreground">
                        Visualize e gerencie todos os alunos matriculados.
                    </p>
                </div>
                <Button asChild className="min-h-[44px] touch-manipulation">
                    <Link href="/alunos/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Aluno
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Todos os Alunos</CardTitle>
                            <CardDescription>
                                Lista completa de alunos cadastrados.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AlunoListWrapper alunos={alunos} />
                </CardContent>
            </Card>
        </div>
    );
}
