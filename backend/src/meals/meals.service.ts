import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMealDto, UpdateMealDto } from './dto/meal.dto';

@Injectable()
export class MealsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: { date?: string; studentId?: string }) {
    const where: any = {};
    if (query.date) where.date = new Date(query.date);
    if (query.studentId) where.studentId = query.studentId;

    return this.prisma.meal.findMany({
      where,
      include: { student: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async create(dto: CreateMealDto) {
    try {
      return await this.prisma.meal.create({
        data: {
          studentId: dto.studentId,
          date: new Date(dto.date),
          type: dto.type,
          amount: dto.amount || 0,
        },
        include: { student: { select: { id: true, name: true } } },
      });
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002') throw new ConflictException('کھانا پہلے ہی ریکارڈ کیا جا چکا ہے');
      throw e;
    }
  }

  async remove(id: string) {
    return this.prisma.meal.delete({ where: { id } });
  }
}
