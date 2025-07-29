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
import { JournalEntryService } from '../services/journal-entry.service';
import { CreateJournalEntryDto } from '../dto/journal-entry/create-journal-entry.dto';
import { UpdateJournalEntryDto } from '../dto/journal-entry/update-journal-entry.dto';

@ApiTags('Journal Entries')
@Controller('businesses/:businessId/journal-entries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JournalEntryController {
  constructor(private readonly journalEntryService: JournalEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new journal entry' })
  @ApiResponse({ status: 201, description: 'Journal entry created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async createJournalEntry(
    @Param('businessId') businessId: string,
    @Request() req, 
    @Body() createJournalEntryDto: CreateJournalEntryDto
  ) {
    try {
      return await this.journalEntryService.createJournalEntry({
        ...createJournalEntryDto,
        date: new Date(createJournalEntryDto.date),
        userId: req.user.id,
        businessId,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create journal entry',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get journal entries for a business' })
  @ApiResponse({ status: 200, description: 'Journal entries retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'accountId', required: false, description: 'Account ID filter' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  async getJournalEntries(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    try {
      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        accountId,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      };

      return await this.journalEntryService.getJournalEntries(
        req.user.id,
        businessId,
        filters
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve journal entries',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  @ApiResponse({ status: 200, description: 'Journal entry retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  async getJournalEntry(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    try {
      return await this.journalEntryService.getJournalEntry(
        id,
        req.user.id,
        businessId
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve journal entry',
        error.status || HttpStatus.NOT_FOUND
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry updated successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  async updateJournalEntry(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Body() updateJournalEntryDto: UpdateJournalEntryDto,
    @Request() req
  ) {
    try {
      const updateData: any = { ...updateJournalEntryDto };
      if (updateJournalEntryDto.date) {
        updateData.date = new Date(updateJournalEntryDto.date);
      }

      return await this.journalEntryService.updateJournalEntry(
        id,
        updateData,
        req.user.id,
        businessId
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update journal entry',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Journal entry not found' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  async deleteJournalEntry(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    try {
      await this.journalEntryService.deleteJournalEntry(
        id,
        req.user.id,
        businessId
      );
      return { message: 'Journal entry deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete journal entry',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry posted successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  async postJournalEntry(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    try {
      return await this.journalEntryService.postJournalEntry(
        id,
        req.user.id,
        businessId
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to post journal entry',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/void')
  @ApiOperation({ summary: 'Void journal entry' })
  @ApiResponse({ status: 200, description: 'Journal entry voided successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'id', description: 'Journal entry ID' })
  async voidJournalEntry(
    @Param('businessId') businessId: string,
    @Param('id') id: string,
    @Request() req
  ) {
    try {
      return await this.journalEntryService.voidJournalEntry(
        id,
        req.user.id,
        businessId
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to void journal entry',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('account/:accountId/ledger')
  @ApiOperation({ summary: 'Get ledger entries for an account' })
  @ApiResponse({ status: 200, description: 'Ledger entries retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'accountId', description: 'Account ID' })
  async getLedgerEntries(
    @Param('businessId') businessId: string,
    @Param('accountId') accountId: string,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    try {
      const filters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
      };

      return await this.journalEntryService.getLedgerEntries(
        accountId,
        req.user.id,
        businessId,
        filters
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve ledger entries',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
