import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class JournalEntryLineDto {
  @IsString()
  accountId: string;

  @IsNumber()
  @Min(0)
  debitAmount: number;

  @IsNumber()
  @Min(0)
  creditAmount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateJournalEntryLineDto extends JournalEntryLineDto {}

export class UpdateJournalEntryLineDto extends JournalEntryLineDto {
  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  debitAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditAmount?: number;
} 