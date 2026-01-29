"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardNav } from "./dashboard-nav";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/planos": "Planos",
  "/aulas": "Aulas",
  "/alunos": "Alunos",
  "/pagamentos": "Pagamentos",
  "/agendamentos": "Agendamentos",
};

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Obter título da página atual
  const pageTitle =
    pageTitles[
      Object.keys(pageTitles).find((key) => pathname?.startsWith(key)) || ""
    ] || "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Menu mobile - drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden min-h-[44px] min-w-[44px] touch-manipulation"
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <DashboardNav />
        </SheetContent>
      </Sheet>

      {/* Título da página */}
      <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
    </header>
  );
}
