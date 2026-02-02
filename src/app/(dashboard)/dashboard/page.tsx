import { requireAuth } from "@/lib/auth";
import { dashboardQueries } from "@/db/queries/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, DollarSign, CalendarCheck, Percent } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  await requireAuth();

  const stats = await dashboardQueries.getStats();

  const taxaPresenca = stats.agendamentosHoje > 0
    ? Math.round((stats.presencasHoje / stats.agendamentosHoje) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral da operação.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Alunos Ativos */}
        <StatsCard
          title="Alunos Ativos"
          value={stats.alunosAtivos}
          icon={Users}
          description="Total de alunos matriculados e ativos"
        />

        {/* Financeiro Pendente (Mês Atual) */}
        <StatsCard
          title="Pagamentos Pendentes"
          value={formatCurrency(stats.pagamentosPendentes.total)}
          icon={DollarSign}
          description={`${stats.pagamentosPendentes.qtd} faturas em aberto este mês`}
          className="bg-orange-50/50 border-orange-200"
        />

        {/* Presença Hoje */}
        <StatsCard
          title="Agendamentos Hoje"
          value={stats.agendamentosHoje}
          icon={CalendarCheck}
          description={`${stats.presencasHoje} confirmados até agora`}
        />

        {/* Taxa de Comparecimento */}
        <StatsCard
          title="Taxa de Presença"
          value={`${taxaPresenca}%`}
          icon={Percent}
          description="Baseado nos agendamentos de hoje"
        />
      </div>

      {/* Seção de Atividades Recentes ou Aulas do Dia (Pode ser adicionado futuramente) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Espaço para gráficos ou listas detalhadas */}
      </div>
    </div>
  );
}
