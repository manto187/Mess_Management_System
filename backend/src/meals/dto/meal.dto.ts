import { IsString, IsDateString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '@prisma/client';

export class CreateMealDto {
  @IsString()
  studentId: string;

  @IsDateString()
  date: string;

  @IsEnum(MealType)
  type: MealType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;
}

export class UpdateMealDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(MealType)
  type?: MealType;
}

export class MealQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  studentId?: string;
}
