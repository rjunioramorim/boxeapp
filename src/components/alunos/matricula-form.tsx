"use client";

import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { matriculaCompletaSchema, type MatriculaCompletaValues } from "@/schemas/matriculas";
import type { planos, aulas } from "@/db/schema";
import { DiasSemanaSelector } from "@/components/aulas/dias-semana-selector";
import { HorarioInput } from "@/components/aulas/horario-input";
import Link from "next/link";

type Plano = typeof planos.$inferSelect;
type Aula = typeof aulas.$inferSelect;

interface MatriculaFormProps {
    alunoId: string;
    planos: Plano[];
    aulas: Aula[];
    onSubmit: (data: any) => Promise<any>;
    cancelHref?: string;
}

export function MatriculaForm({
    alunoId,
    planos,
    aulas,
    onSubmit,
    cancelHref,
}: MatriculaFormProps) {
    const [selectedPlanoId, setSelectedPlanoId] = useState<string>("");

    const form = useForm<MatriculaCompletaValues>({
        resolver: zodResolver(matriculaCompletaSchema),
        defaultValues: {
            alunoId,
            planoId: "",
            diaVencimento: 5,
            dataInicio: new Date(),
            aulas: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "aulas",
    });

    // Aulas disponíveis (todas as aulas ativas)
    const availableAulas = useMemo(() => {
        return aulas.filter((a) => a.ativo);
    }, [aulas]);

    const selectedPlano = useMemo(() => {
        return planos.find((p) => p.id === selectedPlanoId);
    }, [selectedPlanoId, planos]);

    const handlePlanoChange = (id: string) => {
        setSelectedPlanoId(id);
        form.setValue("planoId", id);
        replace([]); // Resetar seleções ao trocar de plano para evitar carregar dias de plano anterior
    };

    const watchedAulas = form.watch("aulas") || [];
    const totalSelectedDays = useMemo(() => {
        return watchedAulas.reduce((acc, a) => acc + (a.diasSemana?.length || 0), 0);
    }, [watchedAulas]);

    const limit = selectedPlano?.qtdDias || 0;
    const isLimitReached = totalSelectedDays >= limit;

    const toggleAula = (aula: Aula) => {
        const index = fields.findIndex((f) => f.aulaId === aula.id);
        if (index > -1) {
            remove(index);
        } else {
            append({
                aulaId: aula.id,
                diasSemana: [], // Começa desmarcado
                horario: aula.horario.slice(0, 5), // Horário padrão da aula
            });
        }
    };

    const handleSubmit = async (data: MatriculaCompletaValues) => {
        // Converter data para string para passar pela server action se necessário
        // Mas a schema já valida como Date. 
        // Vamos transformar para o formato esperado pela server action (JSON-friendly)
        const payload = {
            ...data,
            dataInicio: data.dataInicio.toISOString().split("T")[0],
        };
        const result = await onSubmit(payload);
        if (result?.success === false && result.issues) {
            result.issues.forEach((issue: any) => {
                form.setError(issue.path[0], { message: issue.message });
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Seleção de Plano */}
                    <FormField
                        control={form.control}
                        name="planoId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Plano de Treino</FormLabel>
                                <Select onValueChange={handlePlanoChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="min-h-[44px]">
                                            <SelectValue placeholder="Selecione um plano" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {planos.map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.nome} - R$ {p.valor} ({p.tipo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Dia de Vencimento */}
                    <FormField
                        control={form.control}
                        name="diaVencimento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dia de Vencimento</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={31}
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        className="min-h-[44px]"
                                    />
                                </FormControl>
                                <FormDescription>Dia do mês para cobrança da mensalidade.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Data de Início */}
                    <FormField
                        control={form.control}
                        name="dataInicio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Início</FormLabel>
                                <FormControl>
                                    <Input
                                        type="date"
                                        value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        className="min-h-[44px]"
                                    />
                                </FormControl>
                                <FormDescription>Data em que o aluno começará a treinar.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Seleção de Aulas */}
                {selectedPlanoId && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <FormLabel className="text-base text-primary">Aulas Disponíveis</FormLabel>
                            {selectedPlano && (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                                    <p>
                                        Plano selecionado: <span className="font-semibold text-foreground">{selectedPlano.nome}</span>.
                                        Permite até <span className="font-semibold text-foreground">{selectedPlano.qtdDias}x na semana</span>.
                                    </p>
                                    <span className={cn(
                                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold w-fit",
                                        isLimitReached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                    )}>
                                        {totalSelectedDays} / {selectedPlano.qtdDias} dias selecionados
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {availableAulas.map((aula) => {
                                const isSelected = fields.some((f) => f.aulaId === aula.id);
                                const id = `aula-select-${aula.id}`;
                                return (
                                    <div
                                        key={aula.id}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-md border transition-colors hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                                            isSelected && "bg-accent border-primary"
                                        )}
                                    >
                                        <Label
                                            htmlFor={id}
                                            className="flex flex-col gap-1 flex-1 cursor-pointer select-none"
                                        >
                                            <span className="text-sm font-bold">{aula.nome}</span>
                                            <div className="text-xs text-muted-foreground font-normal">
                                                {aula.horario.slice(0, 5)} - {aula.duracaoMinutos} min
                                            </div>
                                        </Label>
                                        <Checkbox
                                            id={id}
                                            checked={isSelected}
                                            onCheckedChange={() => toggleAula(aula)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {availableAulas.length === 0 && (
                            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                                Nenhuma aula ativa encontrada.
                            </p>
                        )}
                        <FormMessage>{form.formState.errors.aulas?.message}</FormMessage>
                    </div>
                )}

                {/* Configuração de Horários Customizados (Se aulas selecionadas) */}
                {fields.length > 0 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-t pt-6">Configurar Horários do Aluno</h3>
                        <div className="space-y-8">
                            {fields.map((field, index) => {
                                const aula = aulas.find(a => a.id === field.aulaId);
                                return (
                                    <Card key={field.id} className="border-l-4 border-l-primary">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                                                {aula?.nome}
                                            </CardTitle>
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
                                                                availableDays={aula?.diasSemana}
                                                                isLimitReached={isLimitReached}
                                                                onChange={(newValue) => {
                                                                    const currentAulas = form.getValues("aulas") || [];
                                                                    const otherAulasDays = currentAulas
                                                                        .filter((_, i) => i !== index)
                                                                        .reduce((acc, a) => acc + (a.diasSemana?.length || 0), 0);
                                                                    const totalWithNew = otherAulasDays + newValue.length;

                                                                    // Permitir apenas se não estiver adicionando além do limite
                                                                    if (newValue.length > dField.value.length && totalWithNew > limit) {
                                                                        return;
                                                                    }
                                                                    dField.onChange(newValue);
                                                                }}
                                                                error={form.formState.errors.aulas?.[index]?.diasSemana?.message}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            {selectedPlano?.tipo === "INDIVIDUAL" && (
                                                <FormField
                                                    control={form.control}
                                                    name={`aulas.${index}.horario`}
                                                    render={({ field: hField }) => (
                                                        <FormItem>
                                                            <FormLabel>Horário Específico</FormLabel>
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
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t pt-6">
                    {cancelHref && (
                        <Button
                            asChild
                            variant="outline"
                            className="min-h-[44px] touch-manipulation"
                        >
                            <Link href={cancelHref}>Cancelar</Link>
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={form.formState.isSubmitting || fields.length === 0}
                        className="min-h-[44px] touch-manipulation"
                    >
                        {form.formState.isSubmitting ? "Processando..." : "Confirmar Matrícula"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
