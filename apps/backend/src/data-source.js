"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
// Set defaults if not set
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USERNAME = process.env.DB_USERNAME || 'mixer';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'mixer123';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'mixer_dev';
process.env.DB_LOGGING = process.env.DB_LOGGING || 'false';
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: ['./dist/modules/**/*.entity.js'],
    migrations: ['./dist/migrations/*.js'],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
});
exports.default = AppDataSource;

