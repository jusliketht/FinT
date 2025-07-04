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

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  statementDate?: string;
} 