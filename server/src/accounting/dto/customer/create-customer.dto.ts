import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  paymentTerms?: number;

  @IsOptional()
  @IsString()
  businessId?: string;
} 