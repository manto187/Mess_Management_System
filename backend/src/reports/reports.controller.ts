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
}
