import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateAccountHeadDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean;
} 