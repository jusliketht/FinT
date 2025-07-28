import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class JournalEntryLineDto {
  @ApiProperty({ description: 'Account ID for this line' })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({ description: 'Description for this line', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Debit amount' })
  @IsNumber()
  debit: number;

  @ApiProperty({ description: 'Credit amount' })
  @IsNumber()
  credit: number;
}

export class CreateJournalEntryDto {
  @ApiProperty({ description: 'Journal entry date' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Journal entry description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Reference number', required: false })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiProperty({ description: 'Business ID', required: false })
  @IsUUID()
  @IsOptional()
  businessId?: string;

  @ApiProperty({ description: 'Journal entry status', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Journal entry lines', type: [JournalEntryLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];
} 