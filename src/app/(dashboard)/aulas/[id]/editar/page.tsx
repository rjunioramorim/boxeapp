import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AulaForm } from "@/components/aulas/aula-form";
import { buscarAula, atualizarAula } from "@/actions/aulas";
import { redirect, notFound } from "next/navigation";
import type { AulaFormValues } from "@/schemas/aulas";

export const metadata = {
    title: "Editar Aula | Boxeapp",
    description: "Atualize as informações da aula.",
};

export default async function EditarAulaPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const aula = await buscarAula(id);

    if (!aula) {
        notFound();
    }

    async function handleSubmit(data: AulaFormValues) {
        "use server";
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("diasSemana", JSON.stringify(data.diasSemana));
        formData.append("horario", data.horario);
        formData.append("duracaoMinutos", data.duracaoMinutos.toString());
        formData.append("capacidadeMaxima", data.capacidadeMaxima.toString());
        formData.append("ativo", data.ativo ? "true" : "false");

        const result = await atualizarAula(id, formData);
        if (result.success) {
            redirect("/aulas");
        }
        return result;
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Link href="/aulas">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Editar Aula</h2>
                    <p className="text-muted-foreground">
                        Atualize os horários e configurações da aula.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações da Aula</CardTitle>
                </CardHeader>
                <CardContent>
                    <AulaForm aula={aula} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
