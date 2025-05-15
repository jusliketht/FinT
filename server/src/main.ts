import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Ensure we load the .env file
  require('dotenv').config();

  const app = await NestFactory.create(AppModule);
  
  // Get the ConfigService
  const configService = app.get(ConfigService);
  
  // Enable CORS for the client
  app.enableCors({
    origin: configService.get('CLIENT_URL', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // Create API prefix
  app.setGlobalPrefix('api');
  
  // Get port from environment variable or use 5000 as fallback
  const port = configService.get('PORT', 5000);
  
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}/api`);
  console.log(`Using database: ${configService.get('DATABASE_URL')}`);
  console.log(`Environment: ${configService.get('NODE_ENV')}`);
}
bootstrap(); 