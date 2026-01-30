"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { aulaSchema, type AulaFormValues } from "@/schemas/aulas";
import { DiasSemanaSelector } from "./dias-semana-selector";
import { HorarioInput } from "./horario-input";
import type { aulas } from "@/db/schema";

type Aula = typeof aulas.$inferSelect;

interface AulaFormProps {
    aula?: Aula | null;
    onSubmit: (data: AulaFormValues) => Promise<{ success: boolean; error?: string }>;
    onCancel?: () => void;
}

export function AulaForm({ aula, onSubmit, onCancel }: AulaFormProps) {
    const form = useForm<AulaFormValues>({
        resolver: zodResolver(aulaSchema),
        defaultValues: {
            nome: aula?.nome || "",
            diasSemana: aula?.diasSemana || [],
            horario: aula?.horario?.slice(0, 5) || "",
            duracaoMinutos: aula?.duracaoMinutos || 60,
            capacidadeMaxima: aula?.capacidadeMaxima || 20,
            ativo: aula?.ativo ?? true,
        },
    });

    const handleSubmit = async (data: AulaFormValues) => {
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
                            <FormLabel>Nome da Aula</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ex: Boxe Iniciante"
                                    className="min-h-[44px] touch-manipulation"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="diasSemana"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dias da Semana</FormLabel>
                            <FormControl>
                                <DiasSemanaSelector
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={form.formState.errors.diasSemana?.message}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="horario"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Horário</FormLabel>
                                <FormControl>
                                    <HorarioInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        error={form.formState.errors.horario?.message}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duracaoMinutos"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duração (minutos)</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        min="1"
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        className="min-h-[44px] touch-manipulation"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="capacidadeMaxima"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Capacidade Máxima</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    type="number"
                                    min="1"
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                                    className="min-h-[44px] min-w-[44px] touch-manipulation"
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">
                                    Aula ativa
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                {form.formState.errors.root && (
                    <div className="text-sm text-destructive font-medium">
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pb-10">
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
                            : aula
                                ? "Atualizar Aula"
                                : "Criar Aula"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
