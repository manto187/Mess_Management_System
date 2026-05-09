import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    return this.prisma.student.create({ data: dto });
  }

  async findAll(search?: string) {
    return this.prisma.student.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { room: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        meals: { take: 10, orderBy: { date: 'desc' } },
        payments: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!student) throw new NotFoundException('اسٹوڈنٹ نہیں ملا');
    return student;
  }

  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id);
    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.student.delete({ where: { id } });
  }
}
