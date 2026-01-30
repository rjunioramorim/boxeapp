"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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
import { alunoSchema, type AlunoFormValues } from "@/schemas/alunos";
import type { alunos } from "@/db/schema";

type Aluno = typeof alunos.$inferSelect;

interface AlunoFormProps {
    aluno?: Aluno | null;
    onSubmit: (data: AlunoFormValues) => Promise<any>;
    onCancel?: () => void;
}

export function AlunoForm({ aluno, onSubmit, onCancel }: AlunoFormProps) {
    const form = useForm<AlunoFormValues>({
        resolver: zodResolver(alunoSchema),
        defaultValues: {
            nome: aluno?.nome || "",
            telefone: aluno?.telefone || "",
            email: aluno?.email || "",
            status: (aluno?.status as any) || "ATIVO",
        },
    });

    const handleSubmit = async (data: AlunoFormValues) => {
        const result = await onSubmit(data);
        if (result?.success === false && result.issues) {
            result.issues.forEach((issue: any) => {
                form.setError(issue.path[0], { message: issue.message });
            });
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
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: João Silva" {...field} className="min-h-[44px]" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefone (WhatsApp)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="11999999999"
                                        type="tel"
                                        {...field}
                                        className="min-h-[44px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail (Opcional)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="joao@exemplo.com"
                                        type="email"
                                        {...field}
                                        className="min-h-[44px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status do Aluno</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="min-h-[44px]">
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="ATIVO">Ativo</SelectItem>
                                    <SelectItem value="INATIVO">Inativo</SelectItem>
                                    <SelectItem value="SUSPENSO">Suspenso</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                            : aluno
                                ? "Atualizar Aluno"
                                : "Cadastrar Aluno"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
