import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const [
      totalStudents,
      activeStudents,
      lowBalanceStudents,
      attendanceStats,
      todayExpenses,
      todayTransactions,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'ACTIVE' } }),
      this.prisma.student.count({ where: { balance: { lt: 500 } } }),
      // Group attendance by status for efficiency
      this.prisma.attendance.groupBy({
        by: ['status'],
        _count: true,
        where: { date: { gte: start, lte: end } }
      }),
      this.prisma.expense.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      // Group transactions by type instead of fetching all
      this.prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { createdAt: { gte: start, lte: end } }
      }),
    ]);

    // Extract attendance counts from grouped data
    const presentToday = attendanceStats.find(a => a.status === 'PRESENT')?._count || 0;
    const absentToday = attendanceStats.find(a => a.status === 'ABSENT')?._count || 0;

    // Calculate Today's Income (Deposits) and Meal Charges from grouped data
    let todayIncome = 0;
    let mealCharges = 0;

    todayTransactions.forEach(t => {
      const amount = t._sum.amount || 0;
      if (t.type === TransactionType.DEPOSIT) todayIncome += amount;
      if (t.type === TransactionType.MEAL_CHARGE) mealCharges += amount;
    });

    const expensesTotal = todayExpenses._sum.amount || 0;
    const profitLoss = mealCharges - expensesTotal;

    return {
      students: {
        total: totalStudents,
        active: activeStudents,
        lowBalance: lowBalanceStudents,
      },
      attendance: {
        present: presentToday,
        absent: absentToday,
      },
      finance: {
        todayExpenses: expensesTotal,
        todayIncome: todayIncome,
        mealCharges: mealCharges,
        profitLoss: profitLoss,
      },
    };
  }
}
