import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountDto {
  @ApiProperty({ description: 'Account name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Account type (asset, liability, equity, revenue, expense)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Account code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Account description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Business ID', required: false })
  @IsString()
  @IsOptional()
  businessId?: string;

  @ApiProperty({ description: 'Whether account is active', required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
