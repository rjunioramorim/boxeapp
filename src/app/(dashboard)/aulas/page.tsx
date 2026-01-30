import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AulaListWrapper } from "@/components/aulas/aula-list-wrapper";
import { listarAulas } from "@/actions/aulas";

export const metadata = {
    title: "Aulas | Boxeapp",
    description: "Gerencie as aulas oferecidas na academia.",
};

export default async function AulasPage() {
    const aulas = await listarAulas();

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Aulas</h1>
                    <p className="text-muted-foreground">
                        Gerencie as modalidades, horários e capacidades.
                    </p>
                </div>
                <Button asChild className="min-h-[44px] touch-manipulation">
                    <Link href="/aulas/novo">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Aula
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Todas as Aulas</CardTitle>
                    <CardDescription>
                        Abaixo estão as aulas configuradas no sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AulaListWrapper aulas={aulas} />
                </CardContent>
            </Card>
        </div>
    );
}
