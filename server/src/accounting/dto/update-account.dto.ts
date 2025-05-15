import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';

export class UpdateAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['code'] as const),
) {
  // Allow code to be updated, but keep it required
  code?: string;
} 