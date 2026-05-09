export type Role = 'MUNSHI';
export type StudentStatus = 'ACTIVE' | 'ARCHIVED';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';
export type ExpenseCategory = 'VEGETABLES' | 'MEAT' | 'RICE' | 'FLOUR' | 'GAS' | 'UTILITIES' | 'SALARY' | 'GROCERY' | 'UTILITY' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  phone?: string;
  room?: string;
  status: StudentStatus;
  balance: number;
  joinedAt: string;
  createdAt: string;
  _count?: { meals: number; payments: number };
}

// Map Member to Student for UI compatibility if needed
export type Member = Student;

export interface Meal {
  id: string;
  studentId: string;
  student?: Student;
  date: string;
  type: MealType;
  amount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  description?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  student?: Student;
  amount: number;
  month: number;
  year: number;
  status: PaymentStatus;
  paidAt?: string;
  note?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalExpenses: number;
  collectedThisMonth: number;
  pendingPayments: number;
  totalMealsToday: number;
  recentExpenses: Expense[];
  currentMonth: number;
  currentYear: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
}
