import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountTypesService } from '../services/account-types.service';
import { CreateAccountTypeDto } from '../dto/account-type/create-account-type.dto';
import { UpdateAccountTypeDto } from '../dto/account-type/update-account-type.dto';

@ApiTags('Account Types')
@Controller('account-types')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class AccountTypesController {
  constructor(private readonly accountTypesService: AccountTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account type' })
  @ApiResponse({ status: 201, description: 'Account type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate value' })
  create(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    return this.accountTypesService.create(createAccountTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all account types' })
  @ApiResponse({ status: 200, description: 'Return all account types' })
  findAll() {
    return this.accountTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account type by ID' })
  @ApiResponse({ status: 200, description: 'Return account type details' })
  @ApiResponse({ status: 404, description: 'Account type not found' })
  findOne(@Param('id') id: string) {
    return this.accountTypesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update account type' })
  @ApiResponse({ status: 200, description: 'Account type updated successfully' })
  @ApiResponse({ status: 404, description: 'Account type not found' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error or duplicate value' })
  update(@Param('id') id: string, @Body() updateAccountTypeDto: UpdateAccountTypeDto) {
    return this.accountTypesService.update(id, updateAccountTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account type' })
  @ApiResponse({ status: 200, description: 'Account type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account type not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete - account type is in use' })
  remove(@Param('id') id: string) {
    return this.accountTypesService.remove(id);
  }

  @Post('default')
  @ApiOperation({ summary: 'Create default account types' })
  @ApiResponse({ status: 201, description: 'Default account types created successfully' })
  createDefaults() {
    return this.accountTypesService.createDefaults();
  }
}
