"use client";

import { useTransition, useState } from "react";
import { Plus, UserPlus, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { incluirAlunoAgendamento } from "@/actions/agendamentos";
import { format } from "date-fns";
import { toast } from "sonner";

interface Aluno {
    id: string;
    nome: string;
}

interface Aula {
    id: string;
    nome: string;
    horario: string;
}

interface AddAlunoDialogProps {
    alunos: Aluno[];
    aulas: Aula[];
    dataSelecionada: Date;
}

export function AddAlunoDialog({ alunos, aulas, dataSelecionada }: AddAlunoDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        alunoId: "",
        aulaId: "",
        data: format(dataSelecionada, "yyyy-MM-dd"),
        horario: "",
    });

    const handleAulaChange = (aulaId: string) => {
        const aula = aulas.find((a) => a.id === aulaId);
        setFormData({
            ...formData,
            aulaId,
            horario: aula?.horario || "",
        });
    };

    const handleSubmit = () => {
        if (!formData.alunoId || !formData.aulaId || !formData.data || !formData.horario) {
            toast.error("Preencha todos os campos obrigatórios");
            return;
        }

        startTransition(async () => {
            const result = await incluirAlunoAgendamento(formData);
            if (result.success) {
                toast.success("Aluno incluído com sucesso");
                setOpen(false);
                setFormData({
                    alunoId: "",
                    aulaId: "",
                    data: format(dataSelecionada, "yyyy-MM-dd"),
                    horario: "",
                });
            } else {
                toast.error(result.error || "Erro ao incluir aluno");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="min-h-[44px] touch-manipulation">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Aluno
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Incluir Aluno
                    </DialogTitle>
                    <DialogDescription>
                        Adicione um aluno a uma aula específica neste dia.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="aluno">Aluno</Label>
                        <Select
                            value={formData.alunoId}
                            onValueChange={(val) => setFormData({ ...formData, alunoId: val })}
                        >
                            <SelectTrigger id="aluno">
                                <SelectValue placeholder="Selecione um aluno" />
                            </SelectTrigger>
                            <SelectContent>
                                {alunos.map((aluno) => (
                                    <SelectItem key={aluno.id} value={aluno.id}>
                                        {aluno.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="aula">Aula</Label>
                        <Select
                            value={formData.aulaId}
                            onValueChange={handleAulaChange}
                        >
                            <SelectTrigger id="aula">
                                <SelectValue placeholder="Selecione a aula" />
                            </SelectTrigger>
                            <SelectContent>
                                {aulas.map((aula) => (
                                    <SelectItem key={aula.id} value={aula.id}>
                                        {aula.nome} ({aula.horario.slice(0, 5)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="data"
                                    type="date"
                                    className="pl-10"
                                    value={formData.data}
                                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horario">Horário</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="horario"
                                    type="time"
                                    className="pl-10"
                                    value={formData.horario}
                                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Salvando..." : "Confirmar Inclusão"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
