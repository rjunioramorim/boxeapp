import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanosList } from "@/components/planos/planos-list";
import { listarPlanos } from "@/lib/actions/planos";
import { PlanosListWrapper } from "@/components/planos/planos-list-wrapper";

export default async function PlanosPage() {
  const planos = await listarPlanos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Planos</h2>
          <p className="text-muted-foreground">
            Gerencie os planos de treino disponíveis
          </p>
        </div>
        <Button asChild className="min-h-[44px] touch-manipulation">
          <Link href="/planos/novo">
            <Plus className="size-4" />
            <span className="ml-2">Novo Plano</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanosListWrapper planos={planos} />
        </CardContent>
      </Card>
    </div>
  );
}
