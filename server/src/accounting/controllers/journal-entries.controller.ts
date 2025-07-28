import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JournalEntriesService } from '../services/journal-entries.service';

@Controller('journal-entries')
// @UseGuards(JwtAuthGuard)
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Get()
  async getJournalEntries(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 20;
    
    return this.journalEntriesService.getJournalEntries(
      req.user?.id || 'test-user-id',
      businessId,
      pageNum,
      limitNum,
      status
    );
  }

  @Get(':id')
  async getJournalEntry(@Param('id') id: string, @Request() req) {
    return this.journalEntriesService.getJournalEntry(id, req.user?.id || 'test-user-id');
  }

  @Post()
  async createJournalEntry(
    @Request() req,
    @Body() data: {
      date: string;
      description: string;
      referenceNumber?: string;
      businessId?: string;
      lines: Array<{
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
    }
  ) {
    return this.journalEntriesService.createJournalEntry({
      ...data,
      date: new Date(data.date),
      userId: req.user?.id || 'test-user-id'
    });
  }

  @Delete(':id')
  async deleteJournalEntry(@Param('id') id: string, @Request() req) {
    await this.journalEntriesService.deleteJournalEntry(id, req.user?.id || 'test-user-id');
    return { message: 'Journal entry deleted successfully' };
  }
} 