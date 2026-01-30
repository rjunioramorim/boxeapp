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

interface Pagamento {
    id: string;
    valorEsperado: string;
    aluno: { nome: string };
    mesReferencia: Date;
}

interface ConfirmarPagamentoDialogProps {
    pagamento: Pagamento | null;
    onClose: () => void;
    onConfirm: (formData: FormData) => Promise<any>;
}

export function ConfirmarPagamentoDialog({
    pagamento,
    onClose,
    onConfirm,
}: ConfirmarPagamentoDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!pagamento) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await onConfirm(formData);

        if (result.success) {
            onClose();
        } else {
            setError(result.error || "Erro ao confirmar pagamento");
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={!!pagamento} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Confirmar Pagamento</DialogTitle>
                        <DialogDescription>
                            Confirmando pagamento de <strong>{pagamento.aluno.nome}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="valorPago">Valor Recebido</Label>
                            <Input
                                id="valorPago"
                                name="valorPago"
                                type="number"
                                step="0.01"
                                defaultValue={pagamento.valorEsperado}
                                required
                                className="min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dataPagamento">Data do Pagamento</Label>
                            <Input
                                id="dataPagamento"
                                name="dataPagamento"
                                type="date"
                                defaultValue={new Date().toISOString().split("T")[0]}
                                required
                                className="min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações (Opcional)</Label>
                            <Textarea
                                id="observacoes"
                                name="observacoes"
                                placeholder="Ex: Pago via Pix"
                                rows={3}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm font-medium text-destructive mb-4">{error}</div>
                    )}

                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="min-h-[44px] touch-manipulation"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-h-[44px] touch-manipulation"
                        >
                            {isSubmitting ? "Confirmando..." : "Confirmar Recebimento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
