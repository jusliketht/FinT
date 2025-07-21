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
    return this.integrationService.syncBankTransactions(data.businessId, data.connectionId);
  }

  @Get('bank/accounts/:connectionId')
  async getBankAccounts(@Param('connectionId') connectionId: string) {
    return this.integrationService.getBankAccounts(connectionId);
  }

  @Get('bank/balance/:connectionId/:accountId')
  async getBankAccountBalance(
    @Param('connectionId') connectionId: string,
    @Param('accountId') accountId: string
  ) {
    return this.integrationService.getBankAccountBalance(connectionId, accountId);
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

  @Post('email/low-stock-alert')
  async sendLowStockAlert(@Body() data: { businessId: string; itemData: any }) {
    return this.integrationService.sendLowStockAlert(data.businessId, data.itemData);
  }

  @Post('email/invoice-reminder')
  async sendInvoiceReminder(@Body() invoiceData: any) {
    return this.integrationService.sendInvoiceReminder(invoiceData);
  }

  @Post('email/payment-confirmation')
  async sendPaymentConfirmation(@Body() paymentData: any) {
    return this.integrationService.sendPaymentConfirmation(paymentData);
  }
} 