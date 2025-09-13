import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeText(text: string) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function generateUUID() {
  return crypto.randomUUID();
}

export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);
  return res.json();
}

export async function fetchWithErrorHandlers(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response;
}

export function getTextFromMessage(message: any): string {
  return message.parts
    ?.filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('\n')
    .trim() || '';
}