import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Query,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { JournalEntriesService } from '../services/journal-entries.service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(
    @Body() createJournalEntryDto: CreateJournalEntryDto,
    @GetUser('id') userId: string
  ) {
    return this.journalEntriesService.create(createJournalEntryDto, userId);
  }

  @Post('batch')
  createBatch(
    @Body() transactions: Array<{
      date: string;
      description: string;
      amount: number;
      type: 'credit' | 'debit';
      debitAccountId: string;
      creditAccountId: string;
    }>,
    @GetUser('id') userId: string
  ) {
    return this.journalEntriesService.createBatchFromTransactions(transactions, userId);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.journalEntriesService.findAll(userId, page, limit);
  }

  @Get('summary')
  getSummary(@GetUser('id') userId: string) {
    return this.journalEntriesService.getJournalEntrySummary(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.journalEntriesService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
    @GetUser('id') userId: string
  ) {
    return this.journalEntriesService.update(id, updateJournalEntryDto, userId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @GetUser('id') userId: string
  ) {
    return this.journalEntriesService.remove(id, userId);
  }
} 