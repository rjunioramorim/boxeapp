import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata uma data vinda do banco (DATE sem time) garantindo que não haja
 * deslocamento por conta do fuso horário local.
 */
export function formatarDataDB(date: Date | string | null | undefined, formatStr: string = "dd/MM/yyyy") {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  // Se for uma data vinda do Drizzle (mode: date), ela geralmente vem como 00:00:00 UTC.
  // Somamos o offset do fuso horário local para "trazer" para a meia-noite local.
  const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);

  return format(adjustedDate, formatStr, { locale: ptBR });
}
