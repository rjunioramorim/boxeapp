"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DIAS_SEMANA = [
    { id: 1, label: "Segunda" },
    { id: 2, label: "Terça" },
    { id: 3, label: "Quarta" },
    { id: 4, label: "Quinta" },
    { id: 5, label: "Sexta" },
    { id: 6, label: "Sábado" },
    { id: 7, label: "Domingo" },
];

interface DiasSemanaSelectorProps {
    value: number[];
    onChange: (value: number[]) => void;
    error?: string;
}

export function DiasSemanaSelector({
    value,
    onChange,
    error,
}: DiasSemanaSelectorProps) {
    const toggleDia = (id: number) => {
        if (value.includes(id)) {
            onChange(value.filter((d) => d !== id));
        } else {
            onChange([...value, id].sort());
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {DIAS_SEMANA.map((dia) => (
                    <div
                        key={dia.id}
                        className="flex items-center space-x-2 rounded-md border p-3 hover:bg-accent cursor-pointer"
                        onClick={() => toggleDia(dia.id)}
                    >
                        <Checkbox
                            id={`dia-${dia.id}`}
                            checked={value.includes(dia.id)}
                            onCheckedChange={() => toggleDia(dia.id)}
                            className="min-h-[24px] min-w-[24px] touch-manipulation"
                        />
                        <Label
                            htmlFor={`dia-${dia.id}`}
                            className="text-sm font-medium leading-none cursor-pointer flex-1 py-1"
                        >
                            {dia.label}
                        </Label>
                    </div>
                ))}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
