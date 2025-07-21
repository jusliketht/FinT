import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query
} from '@nestjs/common';
import { AccountHeadsService } from '../services/account-heads.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('account-heads')
@UseGuards(JwtAuthGuard)
export class AccountHeadsController {
  constructor(private readonly accountHeadsService: AccountHeadsService) {}

  @Post()
  create(
    @Body() createAccountHeadDto: any,
    @GetUser('id') userId: string
  ) {
    return this.accountHeadsService.createAccountHead(createAccountHeadDto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('businessId') businessId: string,
    @Query('categoryId') categoryId: string
  ) {
    if (categoryId) {
      return this.accountHeadsService.getAccountsByCategory(categoryId, businessId);
    }
    return this.accountHeadsService.getAllAccountHeads(businessId);
  }

  @Get('chart')
  getChartOfAccounts(
    @GetUser('id') userId: string,
    @Query('businessId') businessId: string
  ) {
    return this.accountHeadsService.getAccountHierarchy(businessId);
  }

  @Get('standard')
  createStandardChart(
    @GetUser('id') userId: string,
    @Query('businessId') businessId: string
  ) {
    return this.accountHeadsService.createStandardChartOfAccounts(businessId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.accountHeadsService.getAccountHeadById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountHeadDto: any,
    @GetUser('id') userId: string
  ) {
    return this.accountHeadsService.updateAccountHead(id, updateAccountHeadDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.accountHeadsService.deleteAccountHead(id);
  }
} 