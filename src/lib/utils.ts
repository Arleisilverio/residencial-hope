import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata para exibição visual (XX) XXXXX-XXXX
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return "";
  const digits = value.replace(/\D/g, '').slice(-11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/**
 * Limpa o número para salvar no banco (apenas dígitos + prefixo 55)
 */
export const cleanPhoneNumber = (value: string): string => {
  if (!value) return "";
  let digits = value.replace(/\D/g, '');
  // Se o usuário não digitou o 55, nós adicionamos
  if (digits.length <= 11 && !digits.startsWith('55')) {
    digits = `55${digits}`;
  }
  return digits;
};

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

export const formatEmail = (value: string): string => {
  if (!value) return "";
  return value.toLowerCase();
};

export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'file';
  const sanitized = fileName.replace(/[^a-zA-Z0-9.\-]/g, '_');
  return sanitized.replace(/_+/g, '_');
};