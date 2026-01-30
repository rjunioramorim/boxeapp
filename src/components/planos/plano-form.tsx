"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { planos, aulas } from "@/db/schema";
import { planoSchema, type PlanoFormValues } from "@/schemas/planos";
import { Badge } from "@/components/ui/badge";

type Plano = typeof planos.$inferSelect;
type Aula = typeof aulas.$inferSelect;

interface PlanoFormProps {
  plano?: (Plano & { aulaIds?: string[] }) | null;
  aulas?: Aula[];
  onSubmit: (data: PlanoFormValues) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
}

export function PlanoForm({ plano, aulas = [], onSubmit, onCancel }: PlanoFormProps) {
  const form = useForm<PlanoFormValues>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      nome: plano?.nome || "",
      tipo: (plano?.tipo as "INDIVIDUAL" | "COLETIVO") || "INDIVIDUAL",
      valor: plano?.valor || "",
      qtdDias: plano?.qtdDias || 3,
      ativo: plano?.ativo ?? true,
      aulaIds: (plano?.aulaIds || []) as string[],
    },
  });

  const handleSubmit = async (data: PlanoFormValues) => {
    const result = await onSubmit(data);
    if (!result.success && result.error) {
      form.setError("root", { message: result.error });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Plano Mensal"
                  className="min-h-[44px] touch-manipulation"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="min-h-[44px] touch-manipulation">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                  <SelectItem value="COLETIVO">Coletivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (R$)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="min-h-[44px] touch-manipulation"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="qtdDias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade de Dias</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  min="1"
                  max="31"
                  value={field.value || ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="3"
                  className="min-h-[44px] touch-manipulation"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="min-h-[24px] min-w-[24px] touch-manipulation"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Plano ativo
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <FormLabel>Aulas Vinculadas</FormLabel>
            <p className="text-sm text-muted-foreground">
              Selecione quais aulas pertencem a este plano.
            </p>
          </div>

          <FormField
            control={form.control}
            name="aulaIds"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {aulas.map((aula) => (
                    <div
                      key={aula.id}
                      className="flex items-center space-x-3 rounded-md border p-4 hover:bg-accent cursor-pointer"
                      onClick={() => {
                        const current = field.value || [];
                        const next = current.includes(aula.id)
                          ? current.filter((id) => id !== aula.id)
                          : [...current, aula.id];
                        field.onChange(next);
                      }}
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(aula.id)}
                          onCheckedChange={() => {
                            // Handled by the div click for better touch target
                          }}
                          className="min-h-[24px] min-w-[24px] touch-manipulation"
                        />
                      </FormControl>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{aula.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {aula.horario.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {aula.diasSemana.map((dia) => (
                            <Badge key={dia} variant="outline" className="text-[10px] px-1 py-0 h-4">
                              {["", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][dia]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {aulas.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                    Nenhuma aula encontrada. <Link href="/aulas/novo" className="text-primary hover:underline">Cadastre aulas primeiro.</Link>
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.formState.errors.root && (
          <div className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="min-h-[44px] touch-manipulation"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="min-h-[44px] touch-manipulation"
          >
            {form.formState.isSubmitting
              ? "Salvando..."
              : plano
                ? "Atualizar"
                : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
