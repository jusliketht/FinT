import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IntegrationService } from '../services/integration.service';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationController {
  constructor(private integrationService: IntegrationService) {}

  @Post('bank/connect')
  async connectBankAPI(@Body() data: { businessId: string; bankCredentials: any }) {
    return this.integrationService.connectBankAPI(data.businessId, data.bankCredentials);
  }

  @Post('bank/sync')
  async syncBankTransactions(@Body() data: { businessId: string; connectionId: string }) {
    return this.integrationService.syncBankTransactions(data.businessId);
  }

  @Delete('bank/disconnect/:connectionId')
  async disconnectBankAPI(@Param('connectionId') connectionId: string) {
    return this.integrationService.disconnectBankAPI(connectionId);
  }

  @Post('payment/process')
  async processPayment(@Body() paymentData: any) {
    return this.integrationService.processPayment(paymentData);
  }

  @Post('email/send')
  async sendEmailNotification(@Body() notificationData: any) {
    return this.integrationService.sendEmailNotification(notificationData);
  }

  @Get('status')
  async getIntegrationStatus(@Body() data: { businessId: string }) {
    return this.integrationService.getIntegrationStatus(data.businessId);
  }
} 