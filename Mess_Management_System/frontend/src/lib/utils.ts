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

export const HALL_LABELS: Record<string, string> = {
  FAISAL_HALL: 'فیصل ہال',
  ATIQUE_HALL: 'عتیق ہال',
  GHAZALI_HALL: 'غزالی ہال',
  ABBAS_MANZIL: 'عباس منزل',
  PGR_HOSTEL: 'پی جی آر ہاسٹل',
  JOHAR_HALL: 'جوہر ہال',
};

export const HALLS = [
  { value: 'FAISAL_HALL', label: 'فیصل ہال' },
  { value: 'ATIQUE_HALL', label: 'عتیق ہال' },
  { value: 'GHAZALI_HALL', label: 'غزالی ہال' },
  { value: 'ABBAS_MANZIL', label: 'عباس منزل' },
  { value: 'PGR_HOSTEL', label: 'پی جی آر ہاسٹل' },
  { value: 'JOHAR_HALL', label: 'جوہر ہال' },
];
