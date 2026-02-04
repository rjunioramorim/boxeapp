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
    cancelHref?: string;
}

import Link from "next/link";

export function AlunoForm({ aluno, onSubmit, cancelHref }: AlunoFormProps) {
    const form = useForm({
        resolver: zodResolver(alunoSchema),
        defaultValues: {
            nome: aluno?.nome || "",
            telefone: aluno?.telefone || "",
            email: aluno?.email || "",
            status: (aluno?.status as "ATIVO" | "INATIVO" | "SUSPENSO") || "ATIVO",
        },
    });

    const handleSubmit = async (data: any) => {
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
                                        placeholder="(11) 99999-9999"
                                        type="tel"
                                        value={field.value}
                                        onChange={(event) => {
                                            const digits = event.target.value.replace(/\D/g, "").slice(0, 11);

                                            if (!digits) {
                                                field.onChange("");
                                                return;
                                            }

                                            if (digits.length <= 2) {
                                                field.onChange(`(${digits}`);
                                                return;
                                            }

                                            if (digits.length <= 7) {
                                                field.onChange(
                                                    `(${digits.slice(0, 2)}) ${digits.slice(2)}`
                                                );
                                                return;
                                            }

                                            field.onChange(
                                                `(${digits.slice(0, 2)}) ${digits.slice(
                                                    2,
                                                    7
                                                )}-${digits.slice(7)}`
                                            );
                                        }}
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
                                        {...field}
                                        value={field.value || ""}
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
