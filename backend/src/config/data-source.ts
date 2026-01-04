import { DataSource } from 'typeorm';
import * as entities from './typeorm.entities';
import * as path from 'path';

/**
 * TypeORM DataSource configuration for CLI commands (migrations, etc.)
 * This is separate from NestJS configuration to allow CLI usage
 */
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'experience_core',
  entities: Object.values(entities),
  migrations: [path.join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true' || false,
});
