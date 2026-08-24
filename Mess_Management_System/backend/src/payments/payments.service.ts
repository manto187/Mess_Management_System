import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { TransactionType } from '../transactions/dto/transaction.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { studentId?: string; month?: number; year?: number }) {
    return this.prisma.payment.findMany({
      where: query,
      include: { student: { select: { id: true, name: true, room: true, hall: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreatePaymentDto) {
    this.logger.log(`💰 Creating payment for student ${dto.studentId}: Rs.${dto.amount}`);
    
    try {
      // Use transaction to ensure atomicity
      return await this.prisma.$transaction(async (tx) => {
        // VALIDATION: If name, room, or hall provided, verify they match the student
        if (dto.studentName || dto.room || dto.hall) {
          const student = await tx.student.findUnique({
            where: { id: dto.studentId },
            select: { id: true, name: true, room: true, hall: true, balance: true },
          });

          if (!student) {
            throw new NotFoundException('طالب علم نہیں ملا');
          }

          // Validate name match
          if (dto.studentName && student.name.toLowerCase() !== dto.studentName.toLowerCase()) {
            throw new ConflictException(`نام میں فرق ہے: ${student.name} ≠ ${dto.studentName}`);
          }

          // Validate room match
          if (dto.room && student.room !== dto.room) {
            throw new ConflictException(`کمرہ نمبر میں فرق ہے: ${student.room} ≠ ${dto.room}`);
          }

          // Validate hall match
          if (dto.hall && student.hall !== dto.hall) {
            throw new ConflictException(`ہال میں فرق ہے: ${student.hall} ≠ ${dto.hall}`);
          }

          this.logger.log(`✅ Student validation passed: ${student.name} | ${student.room} | ${student.hall}`);
        }

        // 1. Create payment record
        const payment = await tx.payment.create({
          data: {
            studentId: dto.studentId,
            amount: dto.amount,
            month: dto.month,
            year: dto.year,
            status: dto.status || 'PAID',
            paidAt: dto.status === 'PAID' ? new Date() : null,
            note: dto.note,
          },
          include: { student: { select: { id: true, name: true, room: true, hall: true, balance: true } } },
        });

        this.logger.log(`✅ Payment record created: ${payment.id}`);

        // 2. If payment is PAID, update student balance and create transaction
        if (payment.status === 'PAID') {
          // Update student balance
          const updatedStudent = await tx.student.update({
            where: { id: dto.studentId },
            data: { balance: { increment: dto.amount } },
            select: { id: true, name: true, room: true, hall: true, balance: true },
          });

          this.logger.log(`✅ Student balance updated: ${payment.student.balance} → ${updatedStudent.balance}`);

          // Create transaction record
          const transaction = await tx.transaction.create({
            data: {
              studentId: dto.studentId,
              amount: dto.amount,
              type: TransactionType.DEPOSIT,
              method: dto.method,
              description: dto.note || `Monthly payment for ${dto.month}/${dto.year}`,
            },
          });

          this.logger.log(`✅ Transaction created: ${transaction.id}`);

          // Return payment with updated balance
          return {
            ...payment,
            student: updatedStudent,
          };
        }

        return payment;
      });
    } catch (e) {
      this.logger.error(`❌ Error creating payment: ${(e as Error).message}`);
      if ((e as { code?: string }).code === 'P2002') {
        throw new ConflictException('اس مہینے کی ادائیگی پہلے ہی ہو چکی ہے');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePaymentDto) {
    this.logger.log(`📝 Updating payment ${id}`);
    
    return await this.prisma.$transaction(async (tx) => {
      // Get existing payment
      const existingPayment = await tx.payment.findUnique({
        where: { id },
        select: { status: true, amount: true, studentId: true },
      });

      if (!existingPayment) {
        throw new NotFoundException('Payment not found');
      }

      // Update payment
      const payment = await tx.payment.update({
        where: { id },
        data: {
          ...dto,
          paidAt: dto.status === 'PAID' ? new Date() : undefined,
        },
        include: { student: { select: { id: true, name: true, balance: true } } },
      });

      // If status changed from PENDING to PAID, update balance and create transaction
      if (existingPayment.status !== 'PAID' && dto.status === 'PAID') {
        this.logger.log(`💰 Payment marked as PAID, updating balance`);
        
        // Update student balance
        const updatedStudent = await tx.student.update({
          where: { id: existingPayment.studentId },
          data: { balance: { increment: existingPayment.amount } },
          select: { id: true, name: true, balance: true },
        });

        this.logger.log(`✅ Balance updated: ${updatedStudent.balance}`);

        // Create transaction
        await tx.transaction.create({
          data: {
            studentId: existingPayment.studentId,
            amount: existingPayment.amount,
            type: TransactionType.DEPOSIT,
            description: `Payment marked as paid`,
          },
        });

        this.logger.log(`✅ Transaction created`);

        return {
          ...payment,
          student: updatedStudent,
        };
      }

      return payment;
    });
  }

  async remove(id: string) {
    this.logger.log(`🗑️ Removing payment ${id}`);
    
    return await this.prisma.$transaction(async (tx) => {
      // Get payment details
      const payment = await tx.payment.findUnique({
        where: { id },
        select: { status: true, amount: true, studentId: true },
      });

      if (!payment) {
        throw new NotFoundException('Payment not found');
      }

      // If payment was PAID, reverse the balance
      if (payment.status === 'PAID') {
        this.logger.log(`💸 Reversing balance for deleted payment`);
        
        await tx.student.update({
          where: { id: payment.studentId },
          data: { balance: { decrement: payment.amount } },
        });

        // Create refund transaction
        await tx.transaction.create({
          data: {
            studentId: payment.studentId,
            amount: payment.amount,
            type: TransactionType.REFUND,
            description: `Payment deleted - balance reversed`,
          },
        });

        this.logger.log(`✅ Balance reversed`);
      }

      // Delete payment
      return tx.payment.delete({ where: { id } });
    });
  }
}
