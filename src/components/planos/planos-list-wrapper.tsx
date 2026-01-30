"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deletarPlano } from "@/actions/planos";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlanosList } from "./planos-list";
import type { planos } from "@/db/schema";

type Plano = typeof planos.$inferSelect;

interface PlanosListWrapperProps {
  planos: Plano[];
}

export function PlanosListWrapper({ planos }: PlanosListWrapperProps) {
  const router = useRouter();
  const [planoParaDeletar, setPlanoParaDeletar] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setPlanoParaDeletar(id);
  };

  const confirmDelete = async () => {
    if (!planoParaDeletar) return;

    setIsDeleting(true);
    try {
      const result = await deletarPlano(planoParaDeletar);
      if (result.success) {
        router.refresh();
        setPlanoParaDeletar(null);
      } else {
        alert(result.error || "Erro ao deletar plano");
      }
    } catch (error) {
      alert("Erro ao deletar plano");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PlanosList planos={planos} onDelete={handleDelete} />
      <Dialog
        open={planoParaDeletar !== null}
        onOpenChange={(open) => !open && setPlanoParaDeletar(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este plano? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPlanoParaDeletar(null)}
              disabled={isDeleting}
              className="min-h-[44px] touch-manipulation"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="min-h-[44px] touch-manipulation"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
