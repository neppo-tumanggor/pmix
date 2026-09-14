import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load .env file
dotenv.config();

// Set defaults if not set
process.env.DB_TYPE = process.env.DB_TYPE || 'sqljs'; // Default to sqljs
process.env.DB_DATABASE = process.env.DB_DATABASE || './data/pmix_dev.sqlite';
process.env.DB_LOGGING = process.env.DB_LOGGING || 'false';

const dbType = process.env.DB_TYPE;

// Ensure data directory exists for SQLite
if (dbType === 'sqljs') {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Helper function to load SQLite database file
const loadSqliteDatabase = (dbPath: string): Uint8Array => {
  const fullPath = path.resolve(dbPath);
  if (fs.existsSync(fullPath)) {
    return new Uint8Array(fs.readFileSync(fullPath));
  }
  return new Uint8Array(0); // Empty database
};

const AppDataSource = dbType === 'postgres' 
  ? new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['./dist/modules/**/*.entity.js'],
      migrations: ['./dist/migrations/*.js'],
      synchronize: false,
      logging: process.env.DB_LOGGING === 'true',
    })
  : new DataSource({
      type: 'sqljs',
      database: loadSqliteDatabase(process.env.DB_DATABASE || './data/pmix_dev.sqlite'),
      entities: ['./dist/modules/**/*.entity.js'],
      migrations: ['./dist/migrations/*.js'],
      synchronize: false,
      logging: process.env.DB_LOGGING === 'true',
    });

export default AppDataSource;
