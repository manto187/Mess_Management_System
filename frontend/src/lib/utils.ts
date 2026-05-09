import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ur-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ur-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export const MONTHS = [
  'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
  'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر',
];

export const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: 'ناشتہ',
  LUNCH: 'دوپہر کا کھانا',
  DINNER: 'رات کا کھانا',
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  GROCERY: 'گروسری',
  UTILITY: 'یوٹیلیٹی',
  SALARY: 'تنخواہ',
  OTHER: 'دیگر',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'باقی',
  PAID: 'ادا',
  PARTIAL: 'جزوی',
};
