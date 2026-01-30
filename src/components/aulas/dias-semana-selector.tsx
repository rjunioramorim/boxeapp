"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
    availableDays?: number[];
    isLimitReached?: boolean;
    error?: string;
}

export function DiasSemanaSelector({
    value,
    onChange,
    availableDays,
    isLimitReached,
    error,
}: DiasSemanaSelectorProps) {
    const filteredDias = availableDays
        ? DIAS_SEMANA.filter(d => availableDays.includes(d.id))
        : DIAS_SEMANA;
    const toggleDia = (id: number) => {
        const isAdding = !value.includes(id);
        if (isAdding) {
            if (isLimitReached) return;
            onChange([...value, id].sort());
        } else {
            onChange(value.filter((d) => d !== id));
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {filteredDias.map((dia) => {
                    const isSelected = value.includes(dia.id);
                    const isDisabled = isLimitReached && !isSelected;

                    return (
                        <div
                            key={dia.id}
                            className={cn(
                                "flex items-center space-x-2 rounded-md border p-3 transition-colors",
                                isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                            )}
                        >
                            <Checkbox
                                id={`dia-${dia.id}`}
                                checked={isSelected}
                                onCheckedChange={() => !isDisabled && toggleDia(dia.id)}
                                disabled={isDisabled}
                                className="min-h-[24px] min-w-[24px] touch-manipulation"
                            />
                            <Label
                                htmlFor={`dia-${dia.id}`}
                                className={cn(
                                    "text-sm font-medium leading-none flex-1 py-1 select-none",
                                    !isDisabled && "cursor-pointer"
                                )}
                            >
                                {dia.label}
                            </Label>
                        </div>
                    );
                })}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
