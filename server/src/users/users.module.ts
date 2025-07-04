import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { BusinessController } from './controllers/business.controller';
import { UsersService } from './services/users.service';
import { BusinessService } from './services/business.service';

@Module({
  controllers: [UsersController, BusinessController],
  providers: [UsersService, BusinessService],
  exports: [UsersService, BusinessService],
})
export class UsersModule {} 