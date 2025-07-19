import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../constants/enums';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Roles(UserRole.Admin, UserRole.Accountant)
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  create(@Body() createAccountDto: CreateAccountDto, @Request() req) {
    return this.accountsService.createAccount({ ...createAccountDto, userId: req.user.id });
  }

  @Get()
  @Roles(UserRole.Admin, UserRole.Accountant, UserRole.Viewer)
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  findAll() {
    return this.accountsService.findAll();
  }

  @Get('trial-balance')
  @Roles(UserRole.Admin, UserRole.Accountant, UserRole.Viewer)
  @ApiOperation({ summary: 'Get trial balance' })
  @ApiResponse({ status: 200, description: 'Return trial balance' })
  getTrialBalance(@Request() req, @Query('businessId') businessId: string, @Query('asOfDate') asOfDate?: string) {
    if (!businessId) {
      throw new Error('Business ID is required for trial balance');
    }
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.accountsService.getTrialBalance(businessId, req.user.id, date);
  }

  @Get(':id')
  @Roles(UserRole.Admin, UserRole.Accountant, UserRole.Viewer)
  @ApiOperation({ summary: 'Get an account by id' })
  @ApiResponse({ status: 200, description: 'Return the account' })
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Admin, UserRole.Accountant)
  @ApiOperation({ summary: 'Update an account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 409, description: 'Account code already exists' })
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @ApiOperation({ summary: 'Delete an account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete account with children or transactions' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  remove(@Param('id') id: string) {
    return this.accountsService.remove(id);
  }
} 