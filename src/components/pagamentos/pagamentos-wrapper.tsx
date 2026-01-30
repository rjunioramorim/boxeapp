"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PagamentoList } from "./pagamento-list";
import { ConfirmarPagamentoDialog } from "./confirmar-pagamento-dialog";
import { confirmarPagamentoAction } from "@/actions/pagamentos";
import { Badge } from "@/components/ui/badge";

interface PagamentosWrapperProps {
    pagamentos: any[];
}

export function PagamentosWrapper({ pagamentos }: PagamentosWrapperProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pagamentoParaConfirmar, setPagamentoParaConfirmar] = useState<any | null>(null);

    // Filtros locais (para debouncing ou UI instantânea se necessário, mas aqui usaremos URL)
    const currentNome = searchParams.get("alunoNome") || "";
    const currentStatus = searchParams.get("status") || "PENDENTE";
    const currentMes = searchParams.get("mes") || format(new Date(), "yyyy-MM");

    const updateFilters = (newFilters: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        router.push(`/pagamentos?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push("/pagamentos");
    };

    const handleConfirm = async (formData: FormData) => {
        if (!pagamentoParaConfirmar) return { success: false, error: "Nenhum pagamento selecionado" };

        const result = await confirmarPagamentoAction(pagamentoParaConfirmar.id, formData);
        if (result.success) {
            setPagamentoParaConfirmar(null);
            router.refresh();
        }
        return result;
    };

    const hasFilters = searchParams.get("alunoNome") || searchParams.get("status") || searchParams.get("mes");

    return (
        <div className="space-y-6">
            {/* Filtros Mobile & Desktop */}
            <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome do aluno..."
                        className="pl-9 min-h-[44px]"
                        defaultValue={currentNome}
                        onChange={(e) => {
                            // Debounce simples ou esperar Enter? Aqui vamos atualizar ao mudar para feedback rápido
                            // mas em produção o ideal é debounce de 500ms
                            const val = e.target.value;
                            const timer = setTimeout(() => {
                                updateFilters({ alunoNome: val || null });
                            }, 500);
                            return () => clearTimeout(timer);
                        }}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    <div className="space-y-1.5 flex-1">
                        <Select
                            value={currentStatus}
                            onValueChange={(val) => updateFilters({ status: val })}
                        >
                            <SelectTrigger className="min-h-[44px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos Status</SelectItem>
                                <SelectItem value="PENDENTE">Pendente</SelectItem>
                                <SelectItem value="PAGO">Pago</SelectItem>
                                <SelectItem value="ATRASADO">Atrasado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 flex-1">
                        <Input
                            type="month"
                            className="min-h-[44px]"
                            value={currentMes}
                            onChange={(e) => updateFilters({ mes: e.target.value })}
                        />
                    </div>

                    {hasFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="col-span-2 sm:col-span-1 h-11 text-muted-foreground"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Limpar
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {pagamentos.length} Mensalidade(s)
                    {currentStatus !== "todos" && (
                        <Badge variant="outline" className="text-[10px] uppercase">{currentStatus}</Badge>
                    )}
                </h3>
            </div>

            <PagamentoList
                pagamentos={pagamentos}
                onConfirm={setPagamentoParaConfirmar}
            />

            <ConfirmarPagamentoDialog
                pagamento={pagamentoParaConfirmar}
                onClose={() => setPagamentoParaConfirmar(null)}
                onConfirm={handleConfirm}
            />
        </div>
    );
}
