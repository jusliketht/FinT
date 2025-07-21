import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateCreditCardDto {
  @IsString()
  cardName: string;

  @IsString()
  @IsOptional()
  cardNumber?: string;

  @IsString()
  cardType: string;

  @IsString()
  bankName: string;

  @IsNumber()
  creditLimit: number;

  @IsNumber()
  @IsOptional()
  dueDate?: number; // Day of month when payment is due

  @IsDateString()
  @IsOptional()
  statementDate?: string;

  @IsString()
  @IsOptional()
  businessId?: string;
} 