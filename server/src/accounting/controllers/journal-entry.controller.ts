import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JournalEntryService } from '../services/journal-entry.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('journal-entries')
@UseGuards(JwtAuthGuard)
export class JournalEntryController {
  constructor(private readonly journalEntryService: JournalEntryService) {}

  @Post()
  async createJournalEntry(
    @Request() req,
    @Body() data: {
      date: string;
      description: string;
      referenceNumber?: string;
      lines: Array<{
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
      businessId?: string;
      status?: string;
    }
  ) {
    return this.journalEntryService.createJournalEntry({
      ...data,
      date: new Date(data.date),
      userId: req.user.id,
      businessId: data.businessId || req.user.businessId,
    });
  }

  @Get()
  async getJournalEntries(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return this.journalEntryService.getJournalEntries(
      req.user.id,
      businessId || req.user.businessId,
      filters
    );
  }

  @Get(':id')
  async getJournalEntry(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.journalEntryService.getJournalEntry(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Put(':id')
  async updateJournalEntry(
    @Request() req,
    @Param('id') id: string,
    @Body() data: {
      date?: string;
      description?: string;
      referenceNumber?: string;
      status?: string;
      lines?: Array<{
        id?: string;
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
      businessId?: string;
    }
  ) {
    const updateData = {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
    };

    return this.journalEntryService.updateJournalEntry(
      id,
      updateData,
      req.user.id,
      data.businessId || req.user.businessId
    );
  }

  @Delete(':id')
  async deleteJournalEntry(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.journalEntryService.deleteJournalEntry(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Post(':id/post')
  async postJournalEntry(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.journalEntryService.postJournalEntry(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Post(':id/void')
  async voidJournalEntry(
    @Request() req,
    @Param('id') id: string,
    @Query('businessId') businessId?: string
  ) {
    return this.journalEntryService.voidJournalEntry(
      id,
      req.user.id,
      businessId || req.user.businessId
    );
  }

  @Get('ledger/:accountId')
  async getLedgerEntries(
    @Request() req,
    @Param('accountId') accountId: string,
    @Query('businessId') businessId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return this.journalEntryService.getLedgerEntries(
      accountId,
      req.user.id,
      businessId || req.user.businessId,
      filters
    );
  }
} 