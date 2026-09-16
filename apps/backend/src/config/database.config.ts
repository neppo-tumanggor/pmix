import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

import { User } from '../modules/auth/entities/user.entity';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity';
import { Session } from '../modules/auth/entities/session.entity';
import { PasswordHistory } from '../modules/auth/entities/password-history.entity';

import { Product } from '../modules/products/entities/product.entity';

import { Settings } from '../modules/settings/entities/settings.entity';
import { AuditLog } from '../modules/settings/entities/audit-log.entity';

import { UserPreferences } from '../modules/users/entities/user-preferences.entity';
import { UserMetadata } from '../modules/users/entities/user-metadata.entity';

function parseBoolean(value: string | boolean | undefined): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
  return false;
}

function loadSqliteDatabase(dbPath: string): Uint8Array {
  const fullPath = path.resolve(process.cwd(), dbPath);
  if (fs.existsSync(fullPath)) {
    return new Uint8Array(fs.readFileSync(fullPath));
  }
  return new Uint8Array(0);
}

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const dbType = configService.get('DB_TYPE', 'sqljs') as 'sqlite' | 'sqljs' | 'postgres';

  const baseConfig: TypeOrmModuleOptions = {
    entities: [
      User,
      RefreshToken,
      Session,
      PasswordHistory,
      Product,
      Settings,
      AuditLog,
      UserPreferences,
      UserMetadata,
    ],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    synchronize: true, // Enable to create tables automatically
    logging: configService.get('DB_LOGGING', false),
  };

  if (dbType === 'postgres') {
    const sslEnabled = parseBoolean(configService.get<string | boolean>('DB_SSL', false));

    return {
      ...baseConfig,
      type: 'postgres',
      host: configService.get('DB_HOST', 'localhost'),
      port: configService.get('DB_PORT', 5432),
      username: configService.get('DB_USERNAME', 'pmix'),
      password: configService.get('DB_PASSWORD', 'pmix123'),
      database: configService.get('DB_DATABASE', 'pmix_dev'),
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    } as any as TypeOrmModuleOptions;
  }

  if (dbType === 'sqlite') {
    const dbPath = configService.get<string>('DB_DATABASE', './data/pmix_dev.sqlite');
    const fullPath = path.resolve(process.cwd(), dbPath);
    const dataDir = path.dirname(fullPath);

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    return {
      ...baseConfig,
      type: 'sqlite',
      database: fullPath,
    } as any as TypeOrmModuleOptions;
  }

  // sqljs (default)
  return {
    ...baseConfig,
    type: 'sqljs',
    database: loadSqliteDatabase(configService.get<string>('DB_DATABASE', './data/pmix_dev.sqlite')),
    autoSave: {
      enabled: true,
      interval: 5000, // Save every 5 seconds
    },
    location: configService.get<string>('DB_DATABASE', './data/pmix_dev.sqlite'),
  } as any as TypeOrmModuleOptions;
}
