import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessService } from '../services/business.service';
import { UserRole, BusinessType } from '../../constants/enums';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateBusinessDto } from '../dto/business/create-business.dto';
import { UpdateBusinessDto } from '../dto/business/update-business.dto';

@ApiTags('Businesses')
@Controller('businesses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @Roles(UserRole.Admin, UserRole.BusinessOwner)
  @ApiOperation({ summary: 'Create a new business' })
  @ApiResponse({ status: 201, description: 'Business created successfully' })
  create(@Body() createBusinessDto: CreateBusinessDto, @Request() req) {
    return this.businessService.create({
      ...createBusinessDto,
      ownerId: req.user.id,
    });
  }

  @Get()
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Get all businesses' })
  @ApiResponse({ status: 200, description: 'Return all businesses' })
  findAll() {
    return this.businessService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get current user businesses' })
  @ApiResponse({ status: 200, description: 'Return user businesses' })
  getMyBusinesses(@Request() req) {
    return this.businessService.getUserBusinesses(req.user.id);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.BusinessOwner)
  @ApiOperation({ summary: 'Get a business by id' })
  @ApiResponse({ status: 200, description: 'Return the business' })
  findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.BusinessOwner)
  @ApiOperation({ summary: 'Update a business' })
  @ApiResponse({ status: 200, description: 'Business updated successfully' })
  update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id, updateBusinessDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Delete a business' })
  @ApiResponse({ status: 200, description: 'Business deleted successfully' })
  remove(@Param('id') id: string) {
    return this.businessService.remove(id);
  }

  @Post(':id/users/:userId')
  @Roles(UserRole.Admin, UserRole.BusinessOwner)
  @ApiOperation({ summary: 'Add a user to a business' })
  @ApiResponse({ status: 200, description: 'User added to business successfully' })
  addUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Query('role') role: string = 'VIEWER'
  ) {
    return this.businessService.addUser(id, userId, role);
  }

  @Delete(':id/users/:userId')
  @Roles(UserRole.Admin, UserRole.BusinessOwner)
  @ApiOperation({ summary: 'Remove a user from a business' })
  @ApiResponse({ status: 200, description: 'User removed from business successfully' })
  removeUser(@Param('id') id: string, @Param('userId') userId: string) {
    return this.businessService.removeUser(id, userId);
  }
}
