import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/account/create-account.dto';
import { UpdateAccountDto } from '../dto/account/update-account.dto';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the current user' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  @ApiQuery({ name: 'includePersonal', required: false, description: 'Include personal accounts' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by account type' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by account name or code' })
  async getAllAccounts(
    @Request() req, 
    @Query('includePersonal') includePersonal?: string,
    @Query('type') type?: string,
    @Query('active') active?: string,
    @Query('search') search?: string
  ) {
    try {
      // For now, return empty array to prevent 404 errors
      // This should be implemented to return user's accounts across all businesses
      return [];
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve accounts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all account types' })
  @ApiResponse({ status: 200, description: 'Return account types' })
  async getAccountTypes() {
    try {
      return await this.accountsService.getAccountTypes();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve account types',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

@ApiTags('Business Accounts')
@Controller('businesses/:businessId/accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessAccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async createAccount(
    @Param('businessId') businessId: string,
    @Request() req, 
    @Body() createAccountDto: CreateAccountDto
  ) {
    try {
      return await this.accountsService.createAccount({
        ...createAccountDto,
        businessId,
        userId: req.user.id,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create account',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get chart of accounts for a business' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by account type' })
  @ApiQuery({ name: 'active', required: false, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by account name or code' })
  async getAllAccounts(
    @Param('businessId') businessId: string,
    @Request() req, 
    @Query('type') type?: string,
    @Query('active') active?: string,
    @Query('search') search?: string
  ) {
    try {
      return await this.accountsService.getAccounts(
        req.user.id,
        businessId,
        true
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve accounts',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get account by ID' })
  async getAccountById(
    @Param('businessId') businessId: string,
    @Param('id') id: string, 
    @Request() req
  ) {
    try {
      return await this.accountsService.getAccount(id, req.user.id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve account',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all account types' })
  @ApiResponse({ status: 200, description: 'Return account types' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getAccountTypes(@Param('businessId') businessId: string) {
    try {
      return await this.accountsService.getAccountTypes();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve account types',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
