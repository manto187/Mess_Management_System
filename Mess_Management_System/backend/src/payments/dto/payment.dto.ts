import { IsString, IsNumber, IsEnum, IsOptional, Min, Max } from 'class-validator';
import { PaymentStatus, PaymentMethod, Hall } from '@prisma/client';

export class CreatePaymentDto {
  @IsString()
  studentId: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;

  // Validation fields for deposit form
  @IsOptional()
  @IsString()
  studentName?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsEnum(Hall)
  hall?: Hall;
}

export class UpdatePaymentDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
