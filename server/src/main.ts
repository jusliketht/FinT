import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const configService = app.get(ConfigService);
    
    // Enable CORS with proper configuration
    app.enableCors({
      origin: configService.get('CLIENT_URL', 'http://localhost:3000'),
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 86400, // 24 hours
    });
    
    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    // Global prefix
    app.setGlobalPrefix('api');
    
    const port = configService.get('PORT', 5000);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    
    await app.listen(port);
    
    logger.log(`🚀 Server is running on http://localhost:${port}/api`);
    logger.log(`📊 Environment: ${nodeEnv}`);
    logger.log(`🔗 Database: ${configService.get('DATABASE_URL')?.split('@')[1] || 'Not configured'}`);
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap(); 