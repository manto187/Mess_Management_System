import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarkAttendanceDto, AttendanceStatus, BulkActionDto } from './dto/attendance.dto';
import { TransactionType } from '../transactions/dto/transaction.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async markAttendance(dto: MarkAttendanceDto) {
    this.logger.log(`Marking attendance: ${JSON.stringify(dto)}`);
    const { studentId, date, status, mealQuantity = 1 } = dto;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Validate meal quantity
    const validMealQuantity = Math.max(1, Math.min(10, mealQuantity));

    // Get daily charge from system config or use default
    const dailyCharge = Number(dto.cost) || 100;
    
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendance.findUnique({
        where: { studentId_date: { studentId, date: attendanceDate } },
      });

      let balanceAdjustment = 0;
      
      // Refund previous charge if exists and wasn't LEAVE
      if (existing && existing.status !== AttendanceStatus.LEAVE) {
        balanceAdjustment += existing.cost;
      }

      // Apply new charge based on status and meal quantity
      // LEAVE = no charge, ABSENT = charge × quantity, PRESENT = charge × quantity
      const cost = status === AttendanceStatus.LEAVE ? 0 : dailyCharge * validMealQuantity;
      balanceAdjustment -= cost;

      const attendance = await tx.attendance.upsert({
        where: { studentId_date: { studentId, date: attendanceDate } },
        create: { 
          studentId, 
          date: attendanceDate, 
          status: status as any, 
          cost,
          mealQuantity: validMealQuantity 
        },
        update: { 
          status: status as any, 
          cost,
          mealQuantity: validMealQuantity 
        },
      });

      // Update balance and create transaction if there's a change
      if (balanceAdjustment !== 0) {
        const isRefund = balanceAdjustment > 0;
        const mealInfo = validMealQuantity > 1 ? ` (${validMealQuantity} meals)` : '';
        await tx.transaction.create({
          data: {
            studentId,
            amount: Math.abs(balanceAdjustment),
            type: isRefund ? TransactionType.REFUND : TransactionType.MEAL_CHARGE,
            description: `Daily ${status === AttendanceStatus.LEAVE ? 'Leave' : status === AttendanceStatus.ABSENT ? 'Absent' : 'Present'}${mealInfo} (${date})`,
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

    // Process in batches of 10 for better performance
    const batchSize = 10;
    for (let i = 0; i < attendances.length; i += batchSize) {
      const batch = attendances.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            await this.markAttendance(item);
            return { success: true };
          } catch (err: any) {
            return { 
              success: false, 
              studentId: item.studentId, 
              message: err.message 
            };
          }
        })
      );

      // Count results
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success) {
          results.success++;
        } else if (result.status === 'fulfilled' && !result.value.success) {
          results.failed++;
          results.errors.push({ 
            studentId: result.value.studentId, 
            message: result.value.message 
          });
        } else if (result.status === 'rejected') {
          results.failed++;
          results.errors.push({ 
            studentId: 'unknown', 
            message: result.reason?.message || 'Unknown error' 
          });
        }
      });
    }
    
    this.logger.log(`Bulk attendance complete: ${results.success} success, ${results.failed} failed`);
    return results;
  }

  /**
   * NEW FEATURE: Bulk action for all students or selected students
   * Mark All Present / Mark All Absent / Mark All Leave
   */
  async bulkAction(dto: BulkActionDto) {
    this.logger.log(`Bulk action: ${dto.status} for date ${dto.date}`);
    
    const attendanceDate = new Date(dto.date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Get students to mark
    let students;
    if (dto.studentIds && dto.studentIds.length > 0) {
      // Mark only selected students
      students = await this.prisma.student.findMany({
        where: { 
          id: { in: dto.studentIds },
          status: 'ACTIVE' 
        },
        select: { id: true, name: true }
      });
    } else {
      // Mark all active students
      students = await this.prisma.student.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true }
      });
    }

    this.logger.log(`Found ${students.length} students for bulk action`);

    // Create attendance records for all students
    const attendances = students.map(student => ({
      studentId: student.id,
      date: dto.date,
      status: dto.status,
      mealQuantity: dto.mealQuantity || 1,
      cost: 100 // Default cost, will be calculated in markAttendance
    }));

    // Use existing markBulk method
    return this.markBulk({ attendances });
  }

  async getAttendanceByDate(date: string) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { date: d },
      include: { student: { select: { id: true, name: true, room: true } } }
    });
  }

  async getAllStudentsWithAttendance(date: string) {
    try {
      this.logger.log(`📅 Fetching attendance for date: ${date}`);
      
      // Validate date
      if (!date || date === 'undefined' || date === 'null') {
        throw new BadRequestException('Date is required');
      }

      const d = new Date(date);
      if (isNaN(d.getTime())) {
        throw new BadRequestException(`Invalid date format: ${date}`);
      }
      d.setHours(0, 0, 0, 0);

      this.logger.log(`🔍 Querying students with status: ACTIVE`);
      
      // Get all active students with hall info
      const students = await this.prisma.student.findMany({
        where: { status: 'ACTIVE' },
        select: { 
          id: true, 
          name: true, 
          room: true, 
          hall: true,
          balance: true 
        },
        orderBy: { name: 'asc' }
      });

      this.logger.log(`✅ Found ${students.length} active students`);

      // Get attendance for this date
      const attendanceRecords = await this.prisma.attendance.findMany({
        where: { date: d },
      });

      this.logger.log(`✅ Found ${attendanceRecords.length} attendance records for ${date}`);

      // Create a map for quick lookup
      const attendanceMap = new Map(
        attendanceRecords.map(a => [a.studentId, a])
      );

      // Combine data - unmarked students are PRESENT by default
      const result = students.map(student => ({
        ...student,
        attendance: attendanceMap.get(student.id) || {
          status: AttendanceStatus.PRESENT,
          cost: 0,
          mealQuantity: 1,
          date: d
        }
      }));

      this.logger.log(`✅ Returning ${result.length} students with attendance`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Error in getAllStudentsWithAttendance: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
}
