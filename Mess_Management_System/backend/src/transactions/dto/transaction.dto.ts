import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { TransactionType, PaymentMethod } from '@prisma/client';

export { TransactionType, PaymentMethod };

export class CreateTransactionDto {
  @IsString()
  studentId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}
