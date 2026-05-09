import { IsString, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus, MealType } from '@prisma/client';

export { AttendanceStatus, MealType };

export class MarkAttendanceDto {
  @IsString()
  studentId: string;

  @IsString()
  date: string;

  @IsString()
  type: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cost?: number;
}

export class BulkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceDto)
  attendances: MarkAttendanceDto[];
}
