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
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto, GetCustomersQueryDto } from '../dto/customer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    return this.customerService.create(createCustomerDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'Return all customers' })
  findAll(@Query() query: GetCustomersQueryDto, @Request() req) {
    return this.customerService.findAll(query, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by id' })
  @ApiResponse({ status: 200, description: 'Return the customer' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.customerService.findOne(id, req.user.id);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get customer balance and statistics' })
  @ApiResponse({ status: 200, description: 'Return customer balance information' })
  getBalance(@Param('id') id: string, @Request() req) {
    return this.customerService.getCustomerBalance(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    return this.customerService.update(id, updateCustomerDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  remove(@Param('id') id: string, @Request() req) {
    return this.customerService.remove(id, req.user.id);
  }
} 