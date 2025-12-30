/* eslint-disable @typescript-eslint/no-require-imports */
const dockerCompose = require('docker-compose');
const dotenv = require('dotenv');

dotenv.config();

exports.mochaHooks = {
  beforeAll: async () => {
    if (process.env.WITHOUT_DOCKER) return;
    console.time('global-setup');
    try {
      await dockerCompose.down({ cwd: __dirname });
      await dockerCompose.upAll({ cwd: __dirname });
      await dockerCompose.exec(
        'database',
        ['sh', '-c', 'until pg_isready ; do sleep 1; done'],
        { cwd: __dirname },
      );
      await dockerCompose.exec(
        'database',
        [
          'psql',
          'postgresql://test:test@localhost:5432',
          '-c',
          'drop database if exists ut_test;',
        ],
        { cwd: __dirname },
      );
      await dockerCompose.exec(
        'database',
        [
          'psql',
          'postgresql://test:test@localhost:5432',
          '-c',
          'create database ut_test;',
        ],
        { cwd: __dirname },
      );
    } catch (e) {
      console.log('--before error', JSON.stringify(e));
      throw e;
    }
    console.timeEnd('global-setup');
  },
  afterAll: async () => {
    if (process.env.WITHOUT_DOCKER) return;
    console.time('global-teardown');
    await dockerCompose.down({ cwd: __dirname });
    console.timeEnd('global-teardown');
  },
};
