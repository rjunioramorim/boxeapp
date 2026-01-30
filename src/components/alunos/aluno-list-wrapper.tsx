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
import { AlunoList } from "./aluno-list";
import { deletarAluno } from "@/actions/alunos";
import type { alunos } from "@/db/schema";

type Aluno = typeof alunos.$inferSelect;

interface AlunoListWrapperProps {
    alunos: Aluno[];
}

export function AlunoListWrapper({ alunos }: AlunoListWrapperProps) {
    const router = useRouter();
    const [alunoParaDeletar, setAlunoParaDeletar] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!alunoParaDeletar) return;

        setIsDeleting(true);
        setError(null);

        const result = await deletarAluno(alunoParaDeletar);

        if (result.success) {
            setAlunoParaDeletar(null);
            router.refresh();
        } else {
            setError(result.error || "Erro ao deletar aluno");
        }

        setIsDeleting(false);
    };

    return (
        <>
            <AlunoList alunos={alunos} onDelete={setAlunoParaDeletar} />

            <Dialog
                open={!!alunoParaDeletar}
                onOpenChange={(open) => !open && setAlunoParaDeletar(null)}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir este aluno? Esta ação excluirá também
                            todas as matrículas, pagamentos e agendamentos vinculados.
                        </DialogDescription>
                    </DialogHeader>

                    {error && (
                        <div className="text-sm font-medium text-destructive">{error}</div>
                    )}

                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAlunoParaDeletar(null)}
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
                            {isDeleting ? "Excluindo..." : "Excluir Aluno"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
