import { Test, TestingModule } from '@nestjs/testing';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { expect } from 'chai';
import { Tenant } from '../entities/tenant';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
describe('TenantController', () => {
  let controller: TenantController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Tenant]),
      ],
      controllers: [TenantController],
      providers: [TenantService],
    }).compile();

    controller = module.get<TenantController>(TenantController);

    await loadDatabase({});
  });
  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!controller).to.deep.equal(true);
  });
});
