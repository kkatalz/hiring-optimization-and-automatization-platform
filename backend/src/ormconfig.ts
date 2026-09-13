import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL ?? '';
const isLocalDb = /@(localhost|127\.0\.0\.1)[:/]/.test(databaseUrl);

const dbConfig: PostgresConnectionOptions = {
  type: 'postgres',
  url: databaseUrl,

  entities: [__dirname + '/entities/*.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],

  synchronize: false,
  logging: true,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
};

export const AppDataSource = new DataSource(dbConfig);
export default dbConfig;
