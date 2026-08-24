import { IsString, IsArray, ValidateNested, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

// Define AttendanceStatus enum locally to avoid Prisma import issues
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LEAVE = 'LEAVE',
}

export class MarkAttendanceDto {
  @IsString()
  studentId: string;

  @IsString()
  date: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cost?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  mealQuantity?: number;
}

export class BulkAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkAttendanceDto)
  attendances: MarkAttendanceDto[];
}

export class BulkActionDto {
  @IsString()
  date: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[]; // If provided, only these students will be marked

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  mealQuantity?: number;
}
