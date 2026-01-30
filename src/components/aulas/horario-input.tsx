"use client";

import { Input } from "@/components/ui/input";

interface HorarioInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export function HorarioInput({ value, onChange, error }: HorarioInputProps) {
    return (
        <div className="space-y-1">
            <Input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="min-h-[44px] touch-manipulation text-base"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
