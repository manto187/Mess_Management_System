import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { studentId?: string; month?: number; year?: number }) {
    return this.prisma.payment.findMany({
      where: query,
      include: { student: { select: { id: true, name: true, room: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreatePaymentDto) {
    try {
      return await this.prisma.payment.create({
        data: {
          studentId: dto.studentId,
          amount: dto.amount,
          month: dto.month,
          year: dto.year,
          status: dto.status || 'PAID',
          paidAt: dto.status === 'PAID' ? new Date() : null,
          note: dto.note,
        },
        include: { student: { select: { id: true, name: true } } },
      });
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') throw new ConflictException('اس مہینے کی ادائیگی پہلے ہی ہو چکی ہے');
      throw e;
    }
  }

  async update(id: string, dto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        ...dto,
        paidAt: dto.status === 'PAID' ? new Date() : undefined,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }
}
