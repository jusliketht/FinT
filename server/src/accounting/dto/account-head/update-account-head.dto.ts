import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountHeadDto } from './create-account-head.dto';

export class UpdateAccountHeadDto extends PartialType(CreateAccountHeadDto) {} 