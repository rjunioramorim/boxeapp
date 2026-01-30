"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { criarPagamentoManualAction } from "@/actions/pagamentos";
import { format } from "date-fns";
import { toast } from "sonner";

interface NovoPagamentoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    aluno: {
        id: string;
        nome: string;
        matriculaAtiva?: {
            id: string;
            plano?: {
                valor: string;
            };
        };
    };
}

export function NovoPagamentoDialog({
    open,
    onOpenChange,
    aluno,
}: NovoPagamentoDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<"PENDENTE" | "PAGO">("PENDENTE");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        formData.append("status", status);
        formData.append("alunoId", aluno.id);

        if (aluno.matriculaAtiva?.id) {
            formData.append("matriculaId", aluno.matriculaAtiva.id);
        }

        try {
            const result = await criarPagamentoManualAction(formData);

            if (result.success) {
                toast.success("Pagamento registrado com sucesso!");
                onOpenChange(false);
            } else {
                toast.error(result.error || "Erro ao registrar pagamento");
            }
        } catch (error) {
            toast.error("Erro inesperado ao registrar pagamento");
        } finally {
            setIsSubmitting(false);
        }
    };

    const valorSugerido = aluno.matriculaAtiva?.plano?.valor || "0.00";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Novo Pagamento</DialogTitle>
                        <DialogDescription>
                            Lançar manualmente um pagamento para <strong>{aluno.nome}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="mesReferencia">Mês de Referência</Label>
                                <Input
                                    id="mesReferencia"
                                    name="mesReferencia"
                                    type="month"
                                    defaultValue={format(new Date(), "yyyy-MM")}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dataVencimento">Vencimento</Label>
                                <Input
                                    id="dataVencimento"
                                    name="dataVencimento"
                                    type="date"
                                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="valorEsperado">Valor da Mensalidade</Label>
                            <Input
                                id="valorEsperado"
                                name="valorEsperado"
                                type="number"
                                step="0.01"
                                defaultValue={valorSugerido}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status Inicial</Label>
                            <Select
                                value={status}
                                onValueChange={(val: any) => setStatus(val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                                    <SelectItem value="PAGO">Já foi Pago</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {status === "PAGO" && (
                            <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
                                <div className="space-y-2">
                                    <Label htmlFor="valorPago">Valor Pago</Label>
                                    <Input
                                        id="valorPago"
                                        name="valorPago"
                                        type="number"
                                        step="0.01"
                                        defaultValue={valorSugerido}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dataPagamento">Data do Pagamento</Label>
                                    <Input
                                        id="dataPagamento"
                                        name="dataPagamento"
                                        type="date"
                                        defaultValue={format(new Date(), "yyyy-MM-dd")}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações (Opcional)</Label>
                            <Textarea
                                id="observacoes"
                                name="observacoes"
                                placeholder="Ex: Pagamento adiantado"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Salvando..." : "Salvar Pagamento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
