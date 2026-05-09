import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getLedgerReport(studentId?: string, startDate?: string, endDate?: string) {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    return this.prisma.transaction.findMany({
      where,
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAttendanceReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    return this.prisma.attendance.findMany({
      where,
      include: { student: true },
      orderBy: { date: 'desc' },
    });
  }

  async getExpenseReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async getProfitLossReport(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    const [transactions, expenses] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { createdAt: { gte: start, lte: end } },
      }),
      this.prisma.expense.findMany({
        where: { date: { gte: start, lte: end } },
      }),
    ]);

    let totalDeposits = 0;
    let totalMealCharges = 0;
    let totalRefunds = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.DEPOSIT) totalDeposits += t.amount;
      if (t.type === TransactionType.MEAL_CHARGE) totalMealCharges += t.amount;
      if (t.type === TransactionType.REFUND) totalRefunds += t.amount;
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalMealCharges - totalExpenses;

    return {
      summary: {
        totalDeposits,
        totalMealCharges,
        totalRefunds,
        totalExpenses,
        netProfit,
      },
      period: { start, end }
    };
  }
}
