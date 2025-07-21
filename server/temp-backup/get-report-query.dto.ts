import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetReportQueryDto {
  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsDateString()
  asOfDate?: Date;
} 