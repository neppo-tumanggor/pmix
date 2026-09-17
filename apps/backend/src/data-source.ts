import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { User } from './modules/auth/entities/user.entity';
import { RefreshToken } from './modules/auth/entities/refresh-token.entity';
import { Session } from './modules/auth/entities/session.entity';
import { PasswordHistory } from './modules/auth/entities/password-history.entity';

import { Product } from './modules/products/entities/product.entity';
import { ProductCategory } from './modules/products/entities/product-category.entity';

import { Settings } from './modules/settings/entities/settings.entity';
import { AuditLog } from './modules/settings/entities/audit-log.entity';

import { UserPreferences } from './modules/users/entities/user-preferences.entity';
import { UserMetadata } from './modules/users/entities/user-metadata.entity';

// Load .env file
dotenv.config();

// Set defaults if not set
process.env.DB_TYPE = process.env.DB_TYPE || 'sqljs';
process.env.DB_DATABASE = process.env.DB_DATABASE || './data/pmix_dev.sqlite';
process.env.DB_LOGGING = process.env.DB_LOGGING || 'false';

const dbType = process.env.DB_TYPE;

if (dbType === 'sqljs') {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

const loadSqliteDatabase = (dbPath: string): Uint8Array => {
  const fullPath = path.resolve(dbPath);
  if (fs.existsSync(fullPath)) {
    return new Uint8Array(fs.readFileSync(fullPath));
  }
  return new Uint8Array(0);
};

const entities = [
  User,
  RefreshToken,
  Session,
  PasswordHistory,
  Product,
  ProductCategory,
  Settings,
  AuditLog,
  UserPreferences,
  UserMetadata,
];

const AppDataSource = dbType === 'postgres'
  ? new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities,
      migrations: ['./dist/migrations/*.js'],
      synchronize: false,
      logging: process.env.DB_LOGGING === 'true',
    })
    : new DataSource({
        type: 'sqljs',
        database: loadSqliteDatabase(process.env.DB_DATABASE || './data/pmix_dev.sqlite'),
        entities,
        migrations: ['./dist/migrations/*.js'],
        synchronize: false,
        logging: process.env.DB_LOGGING === 'true',
      });

export default AppDataSource;
