import { IsString, IsDateString, IsNumber, Min, IsOptional, IsBoolean, ValidateNested, ArrayMinSize, Type } from 'class-validator';
import { JournalEntryLineDto } from './journal-entry-line.dto';

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  @ArrayMinSize(2)
  @IsBalanced() // Custom validator for balanced entries
  lines: JournalEntryLineDto[];

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsBoolean()
  isAdjusting?: boolean;

  // GST Fields (India-specific) - moved to line level
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

  // TDS Fields (India-specific) - moved to line level
  @IsOptional()
  @IsString()
  tdsSection?: string; // TDS section (194C, 194J, etc.)

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

// Custom validator for balanced entries
export function IsBalanced(validationOptions?: any) {
  return function (object: Object, propertyName: string) {
    // This will be implemented in the service layer
    // For now, we'll validate in the service
  };
} 