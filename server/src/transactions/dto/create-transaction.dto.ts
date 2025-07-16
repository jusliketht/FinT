import { IsDateString, IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsOptional } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(['income', 'expense', 'transfer', 'adjustment'])
  transactionType: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
} 