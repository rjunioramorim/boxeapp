"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AulaList } from "./aula-list";
import { deletarAula } from "@/actions/aulas";
import type { aulas } from "@/db/schema";

type Aula = typeof aulas.$inferSelect;

interface AulaListWrapperProps {
    aulas: Aula[];
}

export function AulaListWrapper({ aulas }: AulaListWrapperProps) {
    const router = useRouter();
    const [aulaParaDeletar, setAulaParaDeletar] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!aulaParaDeletar) return;

        setIsDeleting(true);
        setError(null);

        const result = await deletarAula(aulaParaDeletar);

        if (result.success) {
            setAulaParaDeletar(null);
            router.refresh();
        } else {
            setError(result.error || "Erro ao deletar aula");
        }

        setIsDeleting(false);
    };

    return (
        <>
            <AulaList aulas={aulas} onDelete={setAulaParaDeletar} />

            <Dialog
                open={!!aulaParaDeletar}
                onOpenChange={(open) => !open && setAulaParaDeletar(null)}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir esta aula? Esta ação não pode ser
                            desfeita e pode afetar planos e alunos vinculados.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="text-sm font-medium text-destructive">{error}</div>
                    )}

                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAulaParaDeletar(null)}
                            disabled={isDeleting}
                            className="min-h-[44px] touch-manipulation"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="min-h-[44px] touch-manipulation"
                        >
                            {isDeleting ? "Excluindo..." : "Excluir Aula"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
