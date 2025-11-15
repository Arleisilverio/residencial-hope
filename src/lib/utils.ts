import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número de telefone no padrão brasileiro (XX) XXXXX-XXXX.
 * @param value A string do telefone a ser formatada.
 * @returns A string do telefone formatada.
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";

  // Remove todos os caracteres não numéricos e limita a 11 dígitos
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Formata um nome completo, capitalizando a primeira letra de cada palavra.
 * @param value A string do nome a ser formatada.
 * @returns A string do nome formatada.
 */
export const formatFullName = (value: string): string => {
  if (!value) return "";
  const exceptions = ['da', 'de', 'do', 'das', 'dos'];
  return value
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index > 0 && exceptions.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Formata um email para letras minúsculas.
 * @param value A string do email a ser formatada.
 * @returns A string do email formatada.
 */
export const formatEmail = (value: string): string => {
  if (!value) return "";
  return value.toLowerCase();
};