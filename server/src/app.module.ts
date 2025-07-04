import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AccountingModule } from './accounting/accounting.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PdfStatementModule } from './pdf-statement/pdf-statement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
          delay: 0,
          priority: 0,
        },
        settings: {
          stalledInterval: 30000,
          maxStalledCount: 1,
          guardInterval: 5000,
          retryProcessDelay: 5000,
        },
      }),
      inject: [ConfigService],
    }),
    AccountingModule,
    AuthModule,
    UsersModule,
    PdfStatementModule,
  ],
})
export class AppModule {} 