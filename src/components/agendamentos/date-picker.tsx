"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date: Date;
}

export function DatePicker({ date }: DatePickerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSelect = (newDate: Date | undefined) => {
        if (newDate) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("data", format(newDate, "yyyy-MM-dd"));
            router.push(`/agendamentos?${params.toString()}`);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-12 border-none shadow-none hover:bg-transparent",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                    <span className="text-lg font-black tracking-tight">
                        {date ? format(date, "dd 'de' MMMM", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                    locale={ptBR}
                />
            </PopoverContent>
        </Popover>
    );
}
