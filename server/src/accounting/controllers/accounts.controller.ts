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
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AccountsService } from '../services/accounts.service';
import { CreateAccountDto } from '../dto/account/create-account.dto';
import { UpdateAccountDto } from '../dto/account/update-account.dto';

@ApiTags('Accounts')
@Controller('accounts')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  async createAccount(@Request() req, @Body() createAccountDto: CreateAccountDto) {
    try {
      return await this.accountsService.createAccount({
        ...createAccountDto,
        userId: req.user?.id || 'test-user-id',
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create account',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'Return all accounts' })
  @ApiQuery({ name: 'businessId', required: false, description: 'Business ID filter' })
  async getAllAccounts(@Request() req, @Query('businessId') businessId?: string) {
    try {
      return await this.accountsService.getAccounts(
        req.user?.id || 'test-user-id',
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
  @ApiResponse({ status: 200, description: 'Return account details' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async getAccountById(@Param('id') id: string, @Request() req) {
    try {
      return await this.accountsService.getAccount(id, req.user?.id || 'test-user-id');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve account',
        error.status || HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async updateAccount(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req
  ) {
    try {
      return await this.accountsService.updateAccount(
        id,
        updateAccountDto,
        req.user?.id || 'test-user-id'
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update account',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  async deleteAccount(@Param('id') id: string, @Request() req) {
    try {
      return await this.accountsService.deleteAccount(id, req.user?.id || 'test-user-id');
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete account',
        error.status || HttpStatus.BAD_REQUEST
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

  @Get('by-type')
  @ApiOperation({ summary: 'Get accounts by type' })
  @ApiResponse({ status: 200, description: 'Return accounts filtered by type' })
  @ApiQuery({ name: 'type', required: false, description: 'Account type filter' })
  @ApiQuery({ name: 'businessId', required: false, description: 'Business ID filter' })
  async getAccountsByType(
    @Request() req,
    @Query('type') type?: string,
    @Query('businessId') businessId?: string
  ) {
    try {
      return await this.accountsService.getAccountsByType(
        req.user?.id || 'test-user-id',
        businessId,
        type
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve accounts by type',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
