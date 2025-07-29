import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IntegrationService } from '../services/integration.service';

@ApiTags('Integrations')
@Controller('businesses/:businessId/integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationController {
  constructor(private integrationService: IntegrationService) {}

  @Post('bank/connect')
  @ApiOperation({ summary: 'Connect bank API' })
  @ApiResponse({ status: 201, description: 'Bank API connected successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async connectBankAPI(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() data: { bankCredentials: any }
  ) {
    return this.integrationService.connectBankAPI(businessId, data.bankCredentials);
  }

  @Post('bank/sync')
  @ApiOperation({ summary: 'Sync bank transactions' })
  @ApiResponse({ status: 200, description: 'Bank transactions synced successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async syncBankTransactions(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() data: { connectionId: string }
  ) {
    return this.integrationService.syncBankTransactions(businessId);
  }

  @Delete('bank/disconnect/:connectionId')
  @ApiOperation({ summary: 'Disconnect bank API' })
  @ApiResponse({ status: 200, description: 'Bank API disconnected successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'connectionId', description: 'Connection ID' })
  async disconnectBankAPI(
    @Param('businessId') businessId: string,
    @Param('connectionId') connectionId: string,
    @Request() req
  ) {
    return this.integrationService.disconnectBankAPI(connectionId);
  }

  @Post('payment/process')
  @ApiOperation({ summary: 'Process payment' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async processPayment(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() paymentData: any
  ) {
    return this.integrationService.processPayment(paymentData);
  }

  @Post('email/send')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({ status: 200, description: 'Email notification sent successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async sendEmailNotification(
    @Param('businessId') businessId: string,
    @Request() req,
    @Body() notificationData: any
  ) {
    return this.integrationService.sendEmailNotification(notificationData);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get integration status' })
  @ApiResponse({ status: 200, description: 'Integration status retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getIntegrationStatus(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.integrationService.getIntegrationStatus(businessId);
  }
}
