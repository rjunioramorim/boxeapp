import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              O dashboard será implementado na Fase 10
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
