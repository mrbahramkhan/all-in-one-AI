import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatCost(usd: number): string { if(usd<0.001) return '$'+(usd*1000).toFixed(3)+'m'; return '$'+usd.toFixed(4); }