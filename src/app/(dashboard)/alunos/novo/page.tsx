import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlunoForm } from "@/components/alunos/aluno-form";
import { criarAluno } from "@/actions/alunos";
import { redirect } from "next/navigation";
import type { AlunoFormValues } from "@/schemas/alunos";

export const metadata = {
    title: "Novo Aluno | Boxeapp",
    description: "Cadastre um novo aluno na academia.",
};

export default function NovoAlunoPage() {
    async function handleSubmit(data: AlunoFormValues) {
        "use server";
        const formData = new FormData();
        formData.append("nome", data.nome);
        formData.append("telefone", data.telefone);
        if (data.email) formData.append("email", data.email);
        formData.append("status", data.status);

        const result = await criarAluno(formData);
        if (result.success && result.data) {
            redirect(`/alunos/${result.data.id}`);
        }
        return result;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
                    <Link href="/alunos">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Novo Aluno</h2>
                    <p className="text-muted-foreground">
                        Insira os dados básicos do novo aluno.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <AlunoForm onSubmit={handleSubmit} cancelHref="/alunos" />
                </CardContent>
            </Card>
        </div>
    );
}
