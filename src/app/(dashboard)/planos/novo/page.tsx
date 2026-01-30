import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanoForm } from "@/components/planos/plano-form";
import { criarPlano } from "@/actions/planos";
import { listarAulas } from "@/actions/aulas";
import { redirect } from "next/navigation";

export default async function NovoPlanoPage() {
  const aulas = await listarAulas();

  async function handleSubmit(data: {
    nome: string;
    tipo: "INDIVIDUAL" | "COLETIVO";
    valor: string;
    qtdDias?: number;
    ativo?: boolean;
    aulaIds: string[];
  }) {
    "use server";
    const formData = new FormData();
    formData.append("nome", data.nome);
    formData.append("tipo", data.tipo);
    formData.append("valor", data.valor);
    if (data.qtdDias) {
      formData.append("qtdDias", data.qtdDias.toString());
    }
    formData.append("ativo", data.ativo ? "true" : "false");
    formData.append("aulaIds", JSON.stringify(data.aulaIds));

    const result = await criarPlano(formData);
    if (result.success) {
      redirect("/planos");
    }
    return result;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-manipulation">
          <Link href="/planos">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Plano</h2>
          <p className="text-muted-foreground">
            Crie um novo plano de treino
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanoForm onSubmit={handleSubmit} aulas={aulas} />
        </CardContent>
      </Card>
    </div>
  );
}
