import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  entities: [__dirname + '/entities/*.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],

  synchronize: false,
  logging: true,
  ssl: false,
};

export const AppDataSource = new DataSource(dbConfig);
export default dbConfig;
