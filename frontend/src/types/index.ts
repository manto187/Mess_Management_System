export type Role = 'ADMIN' | 'MANAGER';
export type MemberStatus = 'ACTIVE' | 'INACTIVE';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';
export type ExpenseCategory = 'GROCERY' | 'UTILITY' | 'SALARY' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  phone?: string;
  room?: string;
  status: MemberStatus;
  joinedAt: string;
  createdAt: string;
  _count?: { meals: number; payments: number };
}

export interface Meal {
  id: string;
  memberId: string;
  member: { id: string; name: string };
  date: string;
  type: MealType;
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
  memberId: string;
  member: { id: string; name: string; room?: string };
  amount: number;
  month: number;
  year: number;
  status: PaymentStatus;
  paidAt?: string;
  note?: string;
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
