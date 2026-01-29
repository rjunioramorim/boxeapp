"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  GraduationCap,
  Users,
  CreditCard,
  Calendar,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/planos", label: "Planos", icon: Package },
  { href: "/aulas", label: "Aulas", icon: GraduationCap },
  { href: "/alunos", label: "Alunos", icon: Users },
  { href: "/pagamentos", label: "Pagamentos", icon: CreditCard },
  { href: "/agendamentos", label: "Agendamentos", icon: Calendar },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 p-4">
      <div className="mb-4 px-2">
        <h2 className="text-lg font-semibold">Boxeapp</h2>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                "min-h-[44px] touch-manipulation", // Touch-friendly
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t pt-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 min-h-[44px] touch-manipulation"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-5" />
          <span>Sair</span>
        </Button>
      </div>
    </nav>
  );
}
