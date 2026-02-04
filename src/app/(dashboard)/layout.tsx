import { requireAuth } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <>
      <div className="flex min-h-screen flex-col md:flex-row">
        {/* Sidebar Desktop - visível apenas em md+ */}
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-muted/40">
          <DashboardNav />
        </aside>

        {/* Conteúdo principal */}
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
        </div>
      </div>

      {/* Bottom navigation mobile */}
      <DashboardBottomNav />
    </>
  );
}
