import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatriculaForm } from "@/components/alunos/matricula-form";
import { buscarAluno } from "@/actions/alunos";
import { getAllPlanosWithAulas } from "@/db/queries/planos";
import { listarAulas } from "@/actions/aulas";
import { criarMatriculaCompleta } from "@/actions/matriculas";
import { redirect, notFound } from "next/navigation";

export const metadata = {
    title: "Nova Matrícula | Boxeapp",
    description: "Matricule o aluno em um plano de treino.",
};

export default async function MatricularAlunoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [aluno, planos, aulas] = await Promise.all([
        buscarAluno(id),
        getAllPlanosWithAulas(),
        listarAulas(),
    ]);

    if (!aluno) {
        notFound();
    }

    async function handleSubmit(data: any) {
        "use server";
        const result = await criarMatriculaCompleta(data);
        if (result.success) {
            redirect(`/alunos/${id}`);
        }
        return result;
    }

    return (
        <div className="space-y-6 pb-10">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Link href={`/alunos/${id}`}>
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Nova Matrícula</h2>
                    <p className="text-muted-foreground">
                        Matriculando: <span className="font-semibold text-foreground">{aluno.nome}</span>
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configurar Plano e Horários</CardTitle>
                </CardHeader>
                <CardContent>
                    <MatriculaForm
                        alunoId={id}
                        planos={planos as any}
                        aulas={aulas}
                        onSubmit={handleSubmit}
                        onCancel={() => redirect(`/alunos/${id}`)}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
