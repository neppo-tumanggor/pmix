import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

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

  // Save sqljs database to disk on shutdown and periodically
  const dbType = configService.get('DB_TYPE', 'sqljs');
  if (dbType === 'sqljs') {
    const dbPath = configService.get<string>('DB_DATABASE', './data/pmix_dev.sqlite');
    const fullPath = path.resolve(process.cwd(), dbPath);
    const dataDir = path.dirname(fullPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const saveDatabase = () => {
      try {
        // Access the data source from the TypeOrmModule
        const typeOrmModule = app.get('TypeOrmModule');
        const dataSource = typeOrmModule?.dataSource as DataSource;
        if (dataSource && dataSource.driver && (dataSource.driver as any).database) {
          const driver = dataSource.driver as any;
          if (driver.database && typeof driver.database.export === 'function') {
            const dbData = driver.database.export();
            const buffer = Buffer.from(dbData);
            fs.writeFileSync(fullPath, buffer);
            logger.log(`SQLite database saved to: ${fullPath}`);
          }
        }
      } catch (error) {
        logger.error('Failed to save database:', error);
      }
    };

    // Save database every 30 seconds
    const saveInterval = setInterval(saveDatabase, 30000);

    // Save on shutdown
    process.on('SIGINT', () => {
      clearInterval(saveInterval);
      saveDatabase();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      clearInterval(saveInterval);
      saveDatabase();
      process.exit(0);
    });
  }
}

bootstrap();

bootstrap();
