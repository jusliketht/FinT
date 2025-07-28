import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAccountTypeDto {
  @ApiProperty({ description: 'Account type value (e.g., asset, liability)' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Account type display label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Account type description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
} 