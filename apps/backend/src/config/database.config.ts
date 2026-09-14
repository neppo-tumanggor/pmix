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
      username: configService.get('DB_USERNAME', 'pmix'),
      password: configService.get('DB_PASSWORD', 'pmix123'),
      database: configService.get('DB_DATABASE', 'pmix_dev'),
      ssl: configService.get('DB_SSL', false) ? { rejectUnauthorized: false } : false,
    } as any as TypeOrmModuleOptions;
  }

  // SQLite (default)
  return {
    ...baseConfig,
    type: 'sqljs',
    database: configService.get<string>('DB_DATABASE', './data/pmix_dev.sqlite'),
  } as any as TypeOrmModuleOptions;
}
