import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req,
  Query,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BusinessService } from '../services/business.service';
import { CreateBusinessDto } from '../dto/business/create-business.dto';
import { UpdateBusinessDto } from '../dto/business/update-business.dto';
import { AddUserToBusinessDto } from '../dto/business/add-user-to-business.dto';

@Controller('businesses')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  async createBusiness(@Body() createBusinessDto: CreateBusinessDto, @Req() request: any) {
    return this.businessService.createBusiness(createBusinessDto, request.user.id);
  }

  @Get()
  async getUserBusinesses(@Req() request: any) {
    return this.businessService.getBusinessesByUser(request.user.id);
  }

  @Get(':id')
  async getBusiness(@Param('id') id: string, @Req() request: any) {
    return this.businessService.findOne(id, request.user.id);
  }

  @Patch(':id')
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Req() request: any
  ) {
    return this.businessService.updateBusiness(id, updateBusinessDto, request.user.id);
  }

  @Delete(':id')
  async deleteBusiness(@Param('id') id: string, @Req() request: any) {
    return this.businessService.deleteBusiness(id, request.user.id);
  }

  @Post(':id/users')
  async addUserToBusiness(
    @Param('id') businessId: string,
    @Body() addUserDto: AddUserToBusinessDto,
    @Req() request: any
  ) {
    return this.businessService.addUserToBusiness(
      businessId,
      addUserDto.userId,
      addUserDto.role,
      request.user.id
    );
  }

  @Get(':id/users')
  async getBusinessUsers(@Param('id') businessId: string, @Req() request: any) {
    return this.businessService.getBusinessUsers(businessId, request.user.id);
  }

  @Delete(':id/users/:userId')
  async removeUserFromBusiness(
    @Param('id') businessId: string,
    @Param('userId') userId: string,
    @Req() request: any
  ) {
    return this.businessService.removeUserFromBusiness(businessId, userId, request.user.id);
  }

  @Get(':id/accounts')
  async getBusinessAccounts(@Param('id') businessId: string, @Req() request: any) {
    // This will be implemented in the accounts service
    // For now, return a placeholder
    return { message: 'Business accounts endpoint - to be implemented' };
  }

  @Get(':id/chart-of-accounts')
  async getChartOfAccounts(@Param('id') businessId: string, @Req() request: any) {
    // This will be implemented in the accounts service
    // For now, return a placeholder
    return { message: 'Chart of accounts endpoint - to be implemented' };
  }

  @Get(':id/trial-balance')
  async getTrialBalance(
    @Param('id') businessId: string, 
    @Query('asOfDate') asOfDate: string,
    @Req() request: any
  ) {
    // This will be implemented in the accounts service
    // For now, return a placeholder
    return { message: 'Trial balance endpoint - to be implemented' };
  }
} 