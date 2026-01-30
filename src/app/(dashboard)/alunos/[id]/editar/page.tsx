import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlunoForm } from "@/components/alunos/aluno-form";
import { buscarAluno, atualizarAluno } from "@/actions/alunos";
import { redirect, notFound } from "next/navigation";
import type { AlunoFormValues } from "@/schemas/alunos";

export const metadata = {
    title: "Editar Aluno | Boxeapp",
    description: "Atualize os dados do aluno.",
};

export default async function EditarAlunoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const aluno = await buscarAluno(id);

    if (!aluno) {
        notFound();
    }

    async function handleSubmit(data: AlunoFormValues) {
        "use server";
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("telefone", data.telefone);
        if (data.email) formData.append("email", data.email);
        formData.append("status", data.status);

        const result = await atualizarAluno(id, formData);
        if (result.success) {
            redirect(`/alunos/${id}`);
        }
        return result;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Link href={`/alunos/${id}`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Editar Aluno</h2>
                    <p className="text-muted-foreground">
                        Atualize as informações de {aluno.nome}.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <AlunoForm aluno={aluno as any} onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}
