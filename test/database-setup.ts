import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 60000,
  username: 'test',
  password: 'test',
  database: 'ut_test',
  entities: [`./src/entities/*{.ts,.js}`],
  synchronize: true,
  // name: 'default',
  // logging: 'all',
});
export const testDatabaseConfig: TypeOrmModuleOptions = dataSource.options;

export const getDatabase = async (): Promise<DataSource> => {
  if (dataSource.isInitialized) {
    return dataSource;
  }
  await dataSource.initialize();
  await dataSource.synchronize(true);
  return dataSource;
};

export const cleanDatabase = async () => {
  const dataSource = await getDatabase();
  const entities = dataSource.entityMetadatas;

  // Get table names in reverse order to try to respect FKs (children first)
  const tableNames = entities
    .map((entity) => `"${entity.tableName}"`)
    .reverse();

  await dataSource.transaction(async (manager) => {
    for (const tableName of tableNames) {
      await manager.query(`ALTER TABLE ${tableName} DISABLE TRIGGER ALL;`);
    }

    for (const tableName of tableNames) {
      await manager.query(`DELETE FROM ${tableName};`);
    }

    for (const tableName of tableNames) {
      await manager.query(`ALTER TABLE ${tableName} ENABLE TRIGGER ALL;`);
    }
  });
};
export const cleanConnection = async (connection: DataSource) => {
  await connection.close();
};

export const loadDatabase = async (data: any) => {
  try {
    const connection = await getDatabase();
    // await connection.synchronize(true);
    await loadDatabaseWithConnection(connection, data);
  } catch (error) {
    console.log('loadDatabase error:', error);
  }
};
export const loadDatabaseWithConnection = async (
  connection: DataSource,
  data: any,
) => {
  // await connection.synchronize(true);
  try {
    for (const table of Object.keys(data)) {
      // deep copy db data, because rep.insert modify input data in place
      const copiedData = data[table].map((item) => ({ ...item }));
      const rep = connection.getRepository(table);
      await rep.insert(copiedData);
    }
  } catch (error) {
    console.log('loadDatabaseWithConnection error:', error);
  }
};
