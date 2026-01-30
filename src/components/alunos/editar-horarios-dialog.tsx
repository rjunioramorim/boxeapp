"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { DiasSemanaSelector } from "@/components/aulas/dias-semana-selector";
import { HorarioInput } from "@/components/aulas/horario-input";
import { atualizarHorarios } from "@/actions/matriculas";
import { useMatriculaStore } from "@/store/use-matricula-store";
import { toast } from "sonner";

const schema = z.object({
    aulas: z.array(z.object({
        aulaId: z.string().uuid(),
        aulaNome: z.string(),
        diasSemana: z.array(z.number().min(1).max(7)).min(1, "Selecione pelo menos um dia"),
        horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
        diasDisponiveis: z.array(z.number()).optional(),
    })).min(1, "Selecione pelo menos uma aula"),
});

type FormValues = z.infer<typeof schema>;

interface EditarHorariosDialogProps {
    matricula: any;
    todasAulas: any[]; // Todas as aulas disponíveis no sistema
    onOpenChange: (open: boolean) => void;
}

export function EditarHorariosDialog({
    matricula,
    todasAulas,
    onOpenChange,
}: EditarHorariosDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            aulas: matricula.matriculasAulas.map((ma: any) => ({
                aulaId: ma.aula.id,
                aulaNome: ma.aula.nome,
                diasSemana: ma.diasSemana || [],
                horario: ma.horario?.slice(0, 5) || "00:00",
                diasDisponiveis: ma.aula.diasSemana || [],
            })),
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "aulas",
    });

    const { setLimit, syncFromAulas, limit, totalSelectedDays, isLimitReached, reset } = useMatriculaStore();

    // Sincronizar limite inicial
    useEffect(() => {
        setLimit(Number(matricula.plano.qtdDias || 0));
    }, [matricula.plano.qtdDias, setLimit]);

    // Sincronizar total de dias quando as aulas mudam
    const watchedAulas = useWatch({
        control: form.control,
        name: "aulas",
    });

    useEffect(() => {
        syncFromAulas(watchedAulas || []);
    }, [watchedAulas, syncFromAulas]);

    // Limpar store ao desmontar
    useEffect(() => {
        return () => reset();
    }, [reset]);

    // Aulas disponíveis que ainda não foram selecionadas
    const aulasDisponiveis = useMemo(() => {
        const currentAulas = form.getValues("aulas") || [];
        const selectedIds = new Set(currentAulas.map(a => a.aulaId));
        return todasAulas.filter(aula => aula.ativo && !selectedIds.has(aula.id));
    }, [todasAulas, watchedAulas]);

    const toggleAula = (aula: any) => {
        const currentAulas = form.getValues("aulas") || [];
        const index = currentAulas.findIndex(a => a.aulaId === aula.id);

        if (index > -1) {
            // Remover aula
            remove(index);
        } else {
            // Adicionar aula
            append({
                aulaId: aula.id,
                aulaNome: aula.nome,
                diasSemana: [],
                horario: aula.horario.slice(0, 5),
                diasDisponiveis: aula.diasSemana || [],
            });
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        toast.loading("Salvando alterações...");

        const result = await atualizarHorarios(
            matricula.id,
            matricula.alunoId,
            data.aulas.map(a => ({
                aulaId: a.aulaId,
                diasSemana: a.diasSemana,
                horario: a.horario
            }))
        );

        toast.dismiss();

        if (result.success) {
            toast.success("Horários atualizados com sucesso!");
            onOpenChange(false);
        } else {
            toast.error(result.error || "Erro ao atualizar horários");
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Horários</DialogTitle>
                    <DialogDescription asChild>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Plano: <span className="font-semibold text-foreground">{matricula.plano.nome}</span>
                                {" "}• Limite: <span className="font-semibold text-foreground">{matricula.plano.qtdDias}x na semana</span>
                            </p>
                            <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold w-fit",
                                isLimitReached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                                {totalSelectedDays} / {matricula.plano.qtdDias} dias selecionados
                            </span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Seleção de Aulas Disponíveis */}
                        {aulasDisponiveis.length > 0 && (
                            <div className="space-y-3">
                                <FormLabel className="text-base">Adicionar Aulas</FormLabel>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {aulasDisponiveis.map((aula) => {
                                        const id = `aula-add-${aula.id}`;
                                        return (
                                            <div
                                                key={aula.id}
                                                className="flex items-center justify-between p-3 rounded-md border transition-colors hover:bg-accent/50"
                                            >
                                                <Label
                                                    htmlFor={id}
                                                    className="flex flex-col gap-1 flex-1 cursor-pointer"
                                                >
                                                    <span className="text-sm font-medium">{aula.nome}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {aula.horario.slice(0, 5)} - {aula.duracaoMinutos} min
                                                    </span>
                                                </Label>
                                                <Checkbox
                                                    id={id}
                                                    checked={false}
                                                    onCheckedChange={() => toggleAula(aula)}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Aulas Selecionadas */}
                        {fields.length > 0 && (
                            <div className="space-y-4">
                                <FormLabel className="text-base">Aulas Selecionadas</FormLabel>
                                {fields.map((field, index) => {
                                    const currentAulas = form.getValues("aulas") || [];
                                    const aula = currentAulas[index];
                                    return (
                                        <Card key={field.id} className="border-l-4 border-l-primary">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                                                        {aula?.aulaNome}
                                                    </CardTitle>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(index)}
                                                        className="h-8 text-xs"
                                                    >
                                                        Remover
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`aulas.${index}.diasSemana`}
                                                    render={({ field: dField }) => (
                                                        <FormItem>
                                                            <FormLabel>Dias da Semana</FormLabel>
                                                            <FormControl>
                                                                <DiasSemanaSelector
                                                                    value={dField.value}
                                                                    availableDays={aula?.diasDisponiveis}
                                                                    isLimitReached={isLimitReached}
                                                                    onChange={(newValue) => {
                                                                        const currentAulas = form.getValues("aulas") || [];
                                                                        const otherAulasDays = currentAulas
                                                                            .filter((_, i) => i !== index)
                                                                            .reduce((acc, a) => acc + (a.diasSemana?.length || 0), 0);
                                                                        const totalWithNew = otherAulasDays + newValue.length;

                                                                        const isReducing = newValue.length < (dField.value?.length || 0);

                                                                        // Bloquear adição se ultrapassar o limite
                                                                        if (!isReducing && totalWithNew > limit) {
                                                                            return;
                                                                        }

                                                                        dField.onChange(newValue);

                                                                        // Sincronizar store
                                                                        const updatedAulas = currentAulas.map((a, i) =>
                                                                            i === index ? { ...a, diasSemana: newValue } : a
                                                                        );
                                                                        syncFromAulas(updatedAulas);
                                                                    }}
                                                                    error={form.formState.errors.aulas?.[index]?.diasSemana?.message}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                                {matricula.plano.tipo === "INDIVIDUAL" && (
                                                    <FormField
                                                        control={form.control}
                                                        name={`aulas.${index}.horario`}
                                                        render={({ field: hField }) => (
                                                            <FormItem>
                                                                <FormLabel>Horário</FormLabel>
                                                                <FormControl>
                                                                    <HorarioInput
                                                                        value={hField.value}
                                                                        onChange={hField.onChange}
                                                                        error={form.formState.errors.aulas?.[index]?.horario?.message}
                                                                    />
                                                                </FormControl>
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}

                        {fields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-md">
                                Nenhuma aula selecionada. Adicione aulas acima.
                            </p>
                        )}

                        <DialogFooter className="flex flex-col gap-2 sm:flex-row sticky bottom-0 bg-background pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="min-h-[44px] touch-manipulation"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || fields.length === 0}
                                className="min-h-[44px] touch-manipulation"
                            >
                                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
