import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionType, AttendanceStatus } from '@prisma/client';

export interface MonthlyStudentReport {
  studentId: string;
  studentName: string;
  room: string | null;
  hall: string | null;
  currentBalance: number;
  monthlyBill: number;
  presentDays: number;
  leaveDays: number;
  absentDays: number;
  totalDeposits: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  monthName: string;
  students: MonthlyStudentReport[];
}

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

  /**
   * Get monthly reports grouped by month
   * Returns all students with their monthly statistics
   */
  async getMonthlyReports(): Promise<MonthlyReport[]> {
    // Get all attendance records grouped by month
    const attendanceRecords = await this.prisma.attendance.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            room: true,
            hall: true,
            balance: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Get all transactions
    const transactions = await this.prisma.transaction.findMany({
      where: { type: TransactionType.DEPOSIT },
      orderBy: { date: 'desc' },
    });

    // Group by month-year
    const monthlyData = new Map<string, MonthlyReport>();

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          month,
          year,
          monthName: this.getMonthName(month),
          students: [],
        });
      }

      const monthReport = monthlyData.get(key)!;
      let studentReport = monthReport.students.find((s) => s.studentId === record.studentId);

      if (!studentReport) {
        studentReport = {
          studentId: record.studentId,
          studentName: record.student.name,
          room: record.student.room,
          hall: record.student.hall,
          currentBalance: record.student.balance,
          monthlyBill: 0,
          presentDays: 0,
          leaveDays: 0,
          absentDays: 0,
          totalDeposits: 0,
        };
        monthReport.students.push(studentReport);
      }

      // Count attendance
      if (record.status === AttendanceStatus.PRESENT) {
        studentReport.presentDays++;
        studentReport.monthlyBill += record.cost;
      } else if (record.status === AttendanceStatus.ABSENT) {
        studentReport.absentDays++;
        studentReport.monthlyBill += record.cost;
      } else if (record.status === AttendanceStatus.LEAVE) {
        studentReport.leaveDays++;
        // Leave days don't add to bill
      }
    });

    // Add deposits to each student's monthly report
    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      const monthReport = monthlyData.get(key);
      if (monthReport) {
        const studentReport = monthReport.students.find((s) => s.studentId === txn.studentId);
        if (studentReport) {
          studentReport.totalDeposits += txn.amount;
        }
      }
    });

    // Convert map to array and sort by date (newest first)
    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }

  /**
   * Get monthly report for a specific student
   * Returns month-by-month breakdown
   */
  async getStudentMonthlyReport(
    studentId: string,
    studentName?: string,
    room?: string,
    hall?: string,
  ): Promise<MonthlyStudentReport[]> {
    // Validate student exists and matches criteria
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, room: true, hall: true, balance: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Validate search criteria if provided
    if (studentName && student.name.toLowerCase() !== studentName.toLowerCase()) {
      throw new Error('Student name does not match');
    }
    if (room && student.room !== room) {
      throw new Error('Room number does not match');
    }
    if (hall && student.hall !== hall) {
      throw new Error('Hall does not match');
    }

    // Get attendance records for this student
    const attendanceRecords = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    // Get deposits for this student
    const deposits = await this.prisma.transaction.findMany({
      where: {
        studentId,
        type: TransactionType.DEPOSIT,
      },
      orderBy: { date: 'desc' },
    });

    // Group by month
    const monthlyData = new Map<string, MonthlyStudentReport>();

    attendanceRecords.forEach((record) => {
      const date = new Date(record.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          studentId: student.id,
          studentName: student.name,
          room: student.room,
          hall: student.hall,
          currentBalance: student.balance,
          monthlyBill: 0,
          presentDays: 0,
          leaveDays: 0,
          absentDays: 0,
          totalDeposits: 0,
        });
      }

      const monthReport = monthlyData.get(key)!;

      if (record.status === AttendanceStatus.PRESENT) {
        monthReport.presentDays++;
        monthReport.monthlyBill += record.cost;
      } else if (record.status === AttendanceStatus.ABSENT) {
        monthReport.absentDays++;
        monthReport.monthlyBill += record.cost;
      } else if (record.status === AttendanceStatus.LEAVE) {
        monthReport.leaveDays++;
      }
    });

    // Add deposits
    deposits.forEach((txn) => {
      const date = new Date(txn.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      const monthReport = monthlyData.get(key);
      if (monthReport) {
        monthReport.totalDeposits += txn.amount;
      }
    });

    return Array.from(monthlyData.values());
  }

  private getMonthName(month: number): string {
    const months = [
      'جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون',
      'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'
    ];
    return months[month - 1] || '';
  }
}
