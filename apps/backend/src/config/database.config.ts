import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const dbType = configService.get('DB_TYPE', 'sqljs') as 'sqljs' | 'postgres';
  
  const baseConfig: TypeOrmModuleOptions = {
    entities: [__dirname + '/../../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    synchronize: false, // Always use migrations for both databases
    logging: configService.get('DB_LOGGING', false),
  };

  if (dbType === 'postgres') {
    return {
      ...baseConfig,
      type: 'postgres',
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get('DB_USERNAME', 'mixer'),
      password: configService.get('DB_PASSWORD', 'mixer123'),
      database: configService.get('DB_DATABASE', 'mixer_dev'),
      ssl: configService.get('DB_SSL', false) ? { rejectUnauthorized: false } : false,
    };
  }

  // SQLite (default)
  return {
    ...baseConfig,
    type: 'sqlite',
    database: configService.get('DB_DATABASE', './data/mixer_dev.sqlite'),
  };
}