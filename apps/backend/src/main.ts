import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // CORS
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:4080');
  app.enableCors({
    origin: corsOrigin.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global prefix
  const port = configService.get('PORT', 3000);
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Environment: ${configService.get('NODE_ENV', 'development')}`);
}

bootstrap();
