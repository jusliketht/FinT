import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto, GetTransactionsQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req: any,
  ) {
    return this.transactionsService.createTransaction(
      createTransactionDto,
      req.user.id
    );
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get transaction categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories(@Request() req: any) {
    return this.transactionsService.getTransactionCategories(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get transactions with filters' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @Query() query: GetTransactionsQueryDto,
    @Request() req: any,
  ) {
    return this.transactionsService.getTransactions(query, req.user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get transaction statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getTransactionStats(
    @Query('businessId') businessId: string,
    @Request() req: any,
  ) {
    return this.transactionsService.getTransactionStats(req.user.id, businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single transaction' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.transactionsService.getTransaction(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req: any,
  ) {
    return this.transactionsService.updateTransaction(
      id,
      updateTransactionDto,
      req.user.id
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a transaction' })
  @ApiResponse({ status: 204, description: 'Transaction deleted successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async deleteTransaction(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.transactionsService.deleteTransaction(id, req.user.id);
  }
} 