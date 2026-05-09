import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  findAll(@Query('search') search?: string) { 
    return this.studentsService.findAll(search); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) { 
    return this.studentsService.findOne(id); 
  }

  @Post()
  create(@Body() dto: CreateStudentDto) { 
    return this.studentsService.create(dto); 
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { 
    return this.studentsService.remove(id); 
  }
}
