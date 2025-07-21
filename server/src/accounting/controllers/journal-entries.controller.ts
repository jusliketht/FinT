import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JournalEntriesService } from '../services/journal-entries.service';

@ApiTags('Journal Entries')
@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
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
      userId: req.user.id
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all journal entries for current context' })
  @ApiResponse({ status: 200, description: 'Return all journal entries' })
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
      req.user.id,
      businessId,
      pageNum,
      limitNum,
      status
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get journal entry statistics' })
  @ApiResponse({ status: 200, description: 'Return journal entry statistics' })
  async getJournalEntryStats(
    @Request() req,
    @Query('businessId') businessId?: string
  ) {
    return this.journalEntriesService.getJournalEntryStats(req.user.id, businessId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiResponse({ status: 200, description: 'Return the journal entry' })
  async getJournalEntry(@Param('id') id: string, @Request() req) {
    return this.journalEntriesService.getJournalEntry(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully' })
  async updateJournalEntry(
    @Param('id') id: string,
    @Body() data: {
      date?: string;
      description?: string;
      referenceNumber?: string;
      status?: string;
      lines?: Array<{
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
    },
    @Request() req
  ) {
    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    return this.journalEntriesService.updateJournalEntry(id, updateData, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  async deleteJournalEntry(@Param('id') id: string, @Request() req) {
    await this.journalEntriesService.deleteJournalEntry(id, req.user.id);
    return { message: 'Journal entry deleted successfully' };
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  async postJournalEntry(@Param('id') id: string, @Request() req) {
    return this.journalEntriesService.postJournalEntry(id, req.user.id);
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry voided successfully' })
  async voidJournalEntry(@Param('id') id: string, @Request() req) {
    return this.journalEntriesService.voidJournalEntry(id, req.user.id);
  }
} 