import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, TransactionType } from './dto/transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    const { studentId, amount, type, method, description } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Transaction record
      const transaction = await tx.transaction.create({
        data: {
          studentId,
          amount,
          type,
          method,
          description,
        },
      });

      // 2. Update Student Balance
      const adjustment = type === TransactionType.MEAL_CHARGE ? -amount : amount;

      await tx.student.update({
        where: { id: studentId },
        data: { balance: { increment: adjustment } },
      });

      return transaction;
    });
  }

  async getStudentLedger(studentId: string) {
    return this.prisma.transaction.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });
  }
}
