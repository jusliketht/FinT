import { IsString, IsDateString, IsNumber, Min, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsString()
  debitAccountId: string;

  @IsString()
  creditAccountId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  businessId?: string;

  // GST Fields (India-specific)
  @IsOptional()
  @IsNumber()
  @Min(0)
  gstRate?: number; // GST rate (5%, 12%, 18%, 28%)

  @IsOptional()
  @IsNumber()
  @Min(0)
  gstAmount?: number; // GST amount

  @IsOptional()
  @IsString()
  gstin?: string; // GSTIN (15-digit)

  @IsOptional()
  @IsString()
  hsnCode?: string; // HSN/SAC code

  @IsOptional()
  @IsString()
  placeOfSupply?: string; // Place of supply (state)

  @IsOptional()
  @IsBoolean()
  isInterState?: boolean; // IGST vs CGST+SGST

  // TDS Fields (India-specific)
  @IsOptional()
  @IsString()
  tdsSection?: string; // TDS section (194C, 194J, etc.)

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsRate?: number; // TDS rate

  @IsOptional()
  @IsNumber()
  @Min(0)
  tdsAmount?: number; // TDS amount

  @IsOptional()
  @IsString()
  panNumber?: string; // PAN number for TDS

  // Additional India-specific fields
  @IsOptional()
  @IsBoolean()
  isMsmeVendor?: boolean; // MSME vendor flag

  @IsOptional()
  @IsString()
  invoiceNumber?: string; // Invoice number

  @IsOptional()
  @IsString()
  vendorName?: string; // Vendor/supplier name
} 