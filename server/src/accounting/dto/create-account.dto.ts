import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, MinLength, MaxLength, Matches } from 'class-validator';
import { AccountType } from '../../constants/enums';

export class CreateAccountDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Account code must contain only uppercase letters and numbers',
  })
  code: string;

  @IsEnum(AccountType)
  type: AccountType;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  subtype?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isSubledger?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsNumber()
  @IsOptional()
  fiscalYear?: number;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
} 