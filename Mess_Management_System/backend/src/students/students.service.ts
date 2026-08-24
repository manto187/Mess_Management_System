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
    const students = await this.prisma.student.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { room: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      select: {
        id: true,
        name: true,
        phone: true,
        room: true,
        hall: true,
        status: true,
        balance: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Sort by room number with proper alphanumeric sorting
    return students.sort((a, b) => {
      if (!a.room && !b.room) return 0;
      if (!a.room) return 1;
      if (!b.room) return -1;

      // Extract letter and number parts
      const parseRoom = (room: string) => {
        const match = room.match(/^([A-Za-z]*)[-\s]*(\d+)$/);
        if (match) {
          return { letter: match[1].toUpperCase() || '', number: parseInt(match[2]) };
        }
        return { letter: room.toUpperCase(), number: 0 };
      };

      const roomA = parseRoom(a.room);
      const roomB = parseRoom(b.room);

      // First sort by letter
      if (roomA.letter !== roomB.letter) {
        return roomA.letter.localeCompare(roomB.letter);
      }

      // Then sort by number
      return roomA.number - roomB.number;
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        payments: { take: 10, orderBy: { createdAt: 'desc' } },
        transactions: { take: 20, orderBy: { createdAt: 'desc' } },
        attendance: { take: 30, orderBy: { date: 'desc' } },
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
