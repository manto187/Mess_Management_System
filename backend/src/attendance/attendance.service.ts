import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto, AttendanceStatus, MealType } from './dto/attendance.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionType } from '../transactions/dto/transaction.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionsService: TransactionsService,
  ) {}

  async markAttendance(dto: MarkAttendanceDto) {
    this.logger.log(`Marking attendance: ${JSON.stringify(dto)}`);
    const { studentId, date, type, status } = dto;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const mealPrice = Number(dto.cost) || 100;
    
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: { studentId_date_type: { studentId, date: attendanceDate, type: type as any } },
      });

      let balanceAdjustment = 0;
      if (existing && existing.status !== AttendanceStatus.LEAVE) {
        balanceAdjustment += existing.cost;
      }

      const cost = status === AttendanceStatus.LEAVE ? 0 : mealPrice;
      balanceAdjustment -= cost;

      const attendance = await tx.attendance.upsert({
        where: { studentId_date_type: { studentId, date: attendanceDate, type: type as any } },
        create: { studentId, date: attendanceDate, type: type as any, status: status as any, cost },
        update: { status: status as any, cost },
      });

      if (balanceAdjustment !== 0) {
        const isRefund = balanceAdjustment > 0;
        await tx.transaction.create({
          data: {
            studentId,
            amount: Math.abs(balanceAdjustment),
            type: isRefund ? TransactionType.REFUND : TransactionType.MEAL_CHARGE,
            description: `${type} ${isRefund ? 'Refund' : 'Charge'} (${date})`,
          },
        });

        await tx.student.update({
          where: { id: studentId },
          data: { balance: { increment: balanceAdjustment } },
        });
      }

      return attendance;
    });
  }

  async markBulk(dto: any) {
    const attendances = dto.attendances || [];
    this.logger.log(`Marking bulk attendance: ${attendances.length} records`);
    const results = { 
      success: 0, 
      failed: 0, 
      errors: [] as { studentId: string; message: string }[] 
    };

    for (const item of attendances) {
      try {
        await this.markAttendance(item);
        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push({ studentId: item.studentId, message: err.message });
        this.logger.error(`Failed to mark attendance for ${item.studentId}: ${err.message}`, err.stack);
      }
    }
    return results;
  }

  async getAttendanceByDate(date: string, type: string) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { date: d, type: type as any },
      include: { student: true }
    });
  }
}
