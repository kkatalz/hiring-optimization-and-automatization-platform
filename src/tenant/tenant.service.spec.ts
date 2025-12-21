import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { Tenant } from '../entities/tenant';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testTenants } from '../../test/fixtures/testTenants';
import { expect } from 'chai';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Tenant]),
      ],
      providers: [TenantService],
    }).compile();

    service = module.get<TenantService>(TenantService);

    await loadDatabase({
      Tenant: testTenants,
    });
  });

  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  it('should find all tenants', async () => {
    const allTenants = await service.findAll();
    expect(allTenants.length).to.deep.equal(2);
  });

  describe('create', () => {
    it('should create tenant', async () => {
      const tenant = await service.create({
        email: 'createTenant@gmail.com',
        slug: 'createTenant',
      });

      expect(tenant.email).to.deep.equal('createTenant@gmail.com');
      expect(tenant.slug).to.deep.equal('createTenant');

      const allTenants = await service.findAll();
      expect(allTenants.length).to.deep.equal(3);
    });

    it('should throw error if tenant with provided slug already exists (deleted = false)', async () => {
      try {
        await service.create({
          email: 'createTenant@gmail.com',
          slug: 'test1',
        });
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Tenant with given slug already exists',
        );
      }
    });
  });

  it('should update tenant', async () => {
    const tenant = await service.update(testTenants[0].id, {
      email: 'updateTenant@gmail.com',
      slug: 'updateTenant',
    });

    expect(tenant.email).to.deep.equal('updateTenant@gmail.com');
    expect(tenant.slug).to.deep.equal('updateTenant');
  });

  it('should remove tenant (update deleted to true)', async () => {
    const tenant = await service.remove(testTenants[0].id);

    expect(tenant.deleted).to.deep.equal(true);
    const allTenants = await service.findAll();
    expect(allTenants.length).to.deep.equal(1);
  });

  it('should find tenant by id', async () => {
    const tenant = await service.findDtoById(testTenants[0].id);

    expect(tenant.email).to.deep.equal('test1@dot.com');
    expect(tenant.slug).to.deep.equal('test1');
  });
});
