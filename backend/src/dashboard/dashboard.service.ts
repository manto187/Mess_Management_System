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
      presentToday,
      absentToday,
      todayExpenses,
      todayTransactions,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.student.count({ where: { status: 'ACTIVE' } }),
      this.prisma.student.count({ where: { balance: { lt: 500 } } }),
      this.prisma.attendance.count({ 
        where: { date: { gte: start, lte: end }, status: 'PRESENT' } 
      }),
      this.prisma.attendance.count({ 
        where: { date: { gte: start, lte: end }, status: 'ABSENT' } 
      }),
      this.prisma.expense.aggregate({
        where: { date: { gte: start, lte: end } },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findMany({
        where: { createdAt: { gte: start, lte: end } },
      }),
    ]);

    // Calculate Today's Income (Deposits) and Meal Charges
    let todayIncome = 0;
    let mealCharges = 0;

    todayTransactions.forEach(t => {
      if (t.type === TransactionType.DEPOSIT) todayIncome += t.amount;
      if (t.type === TransactionType.MEAL_CHARGE) mealCharges += t.amount;
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
