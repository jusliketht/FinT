import { IsString, IsNumber, IsDateString, IsOptional, IsArray, ValidateNested, Min, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBillItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  taxRate?: number;
}

export class CreateBillDto {
  @IsString()
  vendorName: string;

  @IsEmail()
  @IsOptional()
  vendorEmail?: string;

  @IsString()
  @IsOptional()
  vendorPhone?: string;

  @IsString()
  @IsOptional()
  vendorAddress?: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBillItemDto)
  items: CreateBillItemDto[];
} 