import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 將本地電話（已含國碼或 8 位數字）正規化為 `852xxxxxxxx`。
 * 已含 852 前綴者不重複加；僅含數字；不含加號、空格、橫線。
 */
export function normalizePhoneForWhatsapp(phone: string | undefined | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('852') && digits.length >= 11) return digits;
  if (digits.length === 8) return `852${digits}`;
  return digits;
}

/** 產生可開啟的 WhatsApp 連結（手機端走 app，桌面端走 web） */
export function buildWhatsappUrl(phone: string, text: string): string {
  const number = normalizePhoneForWhatsapp(phone);
  const params = new URLSearchParams({ text });
  return `https://wa.me/${number}?${params.toString()}`;
}
