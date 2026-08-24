import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('ledger')
  async getLedger(
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportsService.getLedgerReport(studentId, startDate, endDate);
    return { success: true, data };
  }

  @Get('attendance')
  async getAttendance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportsService.getAttendanceReport(startDate, endDate);
    return { success: true, data };
  }

  @Get('expenses')
  async getExpenses(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportsService.getExpenseReport(startDate, endDate);
    return { success: true, data };
  }

  @Get('profit-loss')
  async getProfitLoss(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const data = await this.reportsService.getProfitLossReport(startDate, endDate);
    return { success: true, data };
  }

  @Get('monthly')
  async getMonthlyReports() {
    const data = await this.reportsService.getMonthlyReports();
    return { success: true, data };
  }

  @Get('student-monthly')
  async getStudentMonthlyReport(
    @Query('studentId') studentId: string,
    @Query('studentName') studentName?: string,
    @Query('room') room?: string,
    @Query('hall') hall?: string,
  ) {
    if (!studentId) {
      return { success: false, message: 'Student ID is required' };
    }
    
    try {
      const data = await this.reportsService.getStudentMonthlyReport(
        studentId,
        studentName,
        room,
        hall,
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, message: (error as Error).message };
    }
  }
}
