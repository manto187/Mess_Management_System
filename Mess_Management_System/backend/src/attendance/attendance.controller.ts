import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto, BulkAttendanceDto, BulkActionDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  mark(@Body() dto: MarkAttendanceDto) {
    return this.attendanceService.markAttendance(dto);
  }

  @Post('save-all')
  markBulk(@Body() body: any) {
    return this.attendanceService.markBulk(body);
  }

  @Post('bulk-action')
  bulkAction(@Body() dto: BulkActionDto) {
    return this.attendanceService.bulkAction(dto);
  }

  @Get()
  getByDate(@Query('date') date: string) {
    return this.attendanceService.getAttendanceByDate(date);
  }

  @Get('all-students')
  getAllWithAttendance(@Query('date') date: string) {
    return this.attendanceService.getAllStudentsWithAttendance(date);
  }
}
