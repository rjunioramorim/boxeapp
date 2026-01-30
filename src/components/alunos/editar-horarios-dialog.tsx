"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { z } from "zod";
import { DiasSemanaSelector } from "@/components/aulas/dias-semana-selector";
import { HorarioInput } from "@/components/aulas/horario-input";
import { atualizarHorarios } from "@/actions/matriculas";

const schema = z.object({
    aulas: z.array(z.object({
        aulaId: z.string().uuid(),
        aulaNome: z.string(),
        diasSemana: z.array(z.number().min(1).max(7)).min(1, "Selecione pelo menos um dia"),
        horario: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
    })),
});

type FormValues = z.infer<typeof schema>;

interface EditarHorariosDialogProps {
    matricula: any;
    onOpenChange: (open: boolean) => void;
}

export function EditarHorariosDialog({
    matricula,
    onOpenChange,
}: EditarHorariosDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            aulas: matricula.matriculasAulas.map((ma: any) => ({
                aulaId: ma.aula.id,
                aulaNome: ma.aula.nome,
                diasSemana: ma.diasSemana,
                horario: ma.horario.slice(0, 5),
            })),
        },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "aulas",
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setError(null);

        const result = await atualizarHorarios(
            matricula.id,
            matricula.alunoId,
            data.aulas.map(a => ({
                aulaId: a.aulaId,
                diasSemana: a.diasSemana,
                horario: a.horario
            }))
        );

        if (result.success) {
            onOpenChange(false);
        } else {
            setError(result.error || "Erro ao atualizar horários");
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Alterar Horários</DialogTitle>
                    <DialogDescription>
                        Ajuste os dias e horários das aulas deste aluno. Os agendamentos futuros não realizados serão atualizados.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        {fields.map((field, index) => (
                            <Card key={field.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider">
                                        {field.aulaNome}
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
                                                        onChange={dField.onChange}
                                                        error={form.formState.errors.aulas?.[index]?.diasSemana?.message}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
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
                                </CardContent>
                            </Card>
                        ))}

                        {error && (
                            <div className="text-sm font-medium text-destructive">{error}</div>
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
                                disabled={isSubmitting}
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
