"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { planos } from "@/db/schema";

type Plano = typeof planos.$inferSelect;

interface PlanosListProps {
  planos: Plano[];
  onDelete?: (id: string) => void;
}

export function PlanosList({ planos, onDelete }: PlanosListProps) {
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value));
  };

  const formatTipo = (tipo: string) => {
    return tipo === "INDIVIDUAL" ? "Individual" : "Coletivo";
  };

  // Mobile: Cards
  const MobileView = () => (
    <div className="space-y-4 md:hidden">
      {planos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum plano cadastrado
          </CardContent>
        </Card>
      ) : (
        planos.map((plano) => (
          <Card key={plano.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{plano.nome}</CardTitle>
                <Badge variant={plano.ativo ? "default" : "secondary"}>
                  {plano.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{formatTipo(plano.tipo)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor:</span>
                <span className="font-medium">{formatCurrency(plano.valor)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Qtd. Dias:</span>
                <span className="font-medium">{plano.qtdDias}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-[44px] touch-manipulation"
                >
                  <Link href={`/planos/${plano.id}/editar`}>
                    <Pencil className="size-4" />
                    <span className="ml-2">Editar</span>
                  </Link>
                </Button>
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 min-h-[44px] touch-manipulation"
                    onClick={() => onDelete(plano.id)}
                  >
                    <Trash2 className="size-4" />
                    <span className="ml-2">Excluir</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  // Desktop: Table
  const DesktopView = () => (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Qtd. Dias</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {planos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Nenhum plano cadastrado
              </TableCell>
            </TableRow>
          ) : (
            planos.map((plano) => (
              <TableRow key={plano.id}>
                <TableCell className="font-medium">{plano.nome}</TableCell>
                <TableCell>{formatTipo(plano.tipo)}</TableCell>
                <TableCell>{formatCurrency(plano.valor)}</TableCell>
                <TableCell>{plano.qtdDias}</TableCell>
                <TableCell>
                  <Badge variant={plano.ativo ? "default" : "secondary"}>
                    {plano.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <Link href={`/planos/${plano.id}/editar`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    {onDelete && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(plano.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
}
