import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'mixer'),
    password: configService.get('DB_PASSWORD', 'mixer123'),
    database: configService.get('DB_DATABASE', 'mixer_dev'),
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    cli: {
      migrationsDir: './migrations',
    },
    synchronize: configService.get('DB_SYNCHRONIZE', false),
    logging: configService.get('DB_LOGGING', false),
    ssl: configService.get('DB_SSL', false) ? { rejectUnauthorized: false } : false,
  };
}