"use client";

import { useTransition, useState, useMemo } from "react";
import { Plus, UserPlus, Calendar as CalendarIcon, Clock, Check, ChevronsUpDown } from "lucide-react";
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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { incluirAlunoAgendamento } from "@/actions/agendamentos";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Aluno {
    id: string;
    nome: string;
}

interface Aula {
    id: string;
    nome: string;
    horario: string;
}

interface Agendamento {
    id: string;
    horario: string;
    status: string;
    data: Date;
    aula: {
        id: string;
        nome: string;
    };
    aluno: {
        id: string;
        nome: string;
    };
}

interface AddAlunoDialogProps {
    alunos: Aluno[];
    aulas: Aula[];
    dataSelecionada: Date;
    agendamentos: Agendamento[];
    aulaPreSelecionada?: string;
}

export function AddAlunoDialog({ alunos, aulas, dataSelecionada, agendamentos, aulaPreSelecionada }: AddAlunoDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchValue, setSearchValue] = useState("");

    // Encontrar horário da aula pré-selecionada, se houver
    const aulaPre = aulaPreSelecionada ? aulas.find(a => a.id === aulaPreSelecionada) : undefined;

    const [formData, setFormData] = useState({
        alunoId: "",
        aulaId: aulaPreSelecionada || "",
        data: format(dataSelecionada, "yyyy-MM-dd"),
        horario: aulaPre?.horario || "",
    });

    // Filtrar alunos disponíveis baseado na aula selecionada
    const alunosDisponiveis = useMemo(() => {
        if (!formData.aulaId || !formData.horario) {
            return alunos;
        }

        // IDs dos alunos já agendados para esta aula/horário/data
        const alunosAgendados = agendamentos
            .filter(
                (ag) =>
                    ag.aula.id === formData.aulaId &&
                    ag.horario === formData.horario &&
                    (new Date(ag.data).toISOString().split("T")[0] === formData.data)
            )
            .map((ag) => ag.aluno.id);

        return alunos.filter((aluno) => !alunosAgendados.includes(aluno.id));
    }, [alunos, agendamentos, formData.aulaId, formData.horario, formData.data]);

    // Filtrar alunos pela busca e limitar a 20 resultados
    const alunosFiltrados = useMemo(() => {
        let filtered = alunosDisponiveis;

        if (searchValue.length > 0) {
            filtered = alunosDisponiveis.filter((aluno) =>
                aluno.nome.toLowerCase().includes(searchValue.toLowerCase())
            );
        }

        return filtered.slice(0, 20);
    }, [alunosDisponiveis, searchValue]);

    const handleAulaChange = (aulaId: string) => {
        const aula = aulas.find((a) => a.id === aulaId);
        setFormData({
            ...formData,
            aulaId,
            horario: aula?.horario || "",
            alunoId: "", // Reset aluno quando mudar a aula
        });
        setSearchValue(""); // Reset busca
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
                setSearchValue("");
            } else {
                toast.error(result.error || "Erro ao incluir aluno");
            }
        });
    };

    const alunoSelecionado = alunos.find((a) => a.id === formData.alunoId);

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
                    {/* 1. AULA (primeiro) */}
                    <div className="space-y-2">
                        <Label htmlFor="aula">Aula / Horário</Label>
                        <Select
                            value={formData.aulaId}
                            onValueChange={handleAulaChange}
                        >
                            <SelectTrigger id="aula">
                                <SelectValue placeholder="Selecione a aula e horário" />
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

                    {/* 2. DATA */}
                    <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="data"
                                type="date"
                                className="pl-10"
                                value={formData.data}
                                onChange={(e) => setFormData({ ...formData, data: e.target.value, alunoId: "" })}
                            />
                        </div>
                    </div>

                    {/* 3. ALUNO (depois, com combobox e busca) */}
                    <div className="space-y-2">
                        <Label htmlFor="aluno">Aluno</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                    disabled={!formData.aulaId}
                                >
                                    {alunoSelecionado
                                        ? alunoSelecionado.nome
                                        : "Selecione um aluno..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput
                                        placeholder="Buscar aluno..."
                                        value={searchValue}
                                        onValueChange={setSearchValue}
                                    />
                                    <CommandList>
                                        {alunosFiltrados.length === 0 ? (
                                            <CommandEmpty>
                                                Nenhum aluno encontrado.
                                            </CommandEmpty>
                                        ) : (
                                            <CommandGroup>
                                                {alunosFiltrados.map((aluno) => (
                                                    <CommandItem
                                                        key={aluno.id}
                                                        value={aluno.nome}
                                                        onSelect={() => {
                                                            setFormData({ ...formData, alunoId: aluno.id });
                                                            setOpenCombobox(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.alunoId === aluno.id
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {aluno.nome}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {!formData.aulaId && (
                            <p className="text-xs text-muted-foreground">
                                Selecione uma aula primeiro
                            </p>
                        )}
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
