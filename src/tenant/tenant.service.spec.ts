import { Test, TestingModule } from '@nestjs/testing';
import { TenantService } from './tenant.service';
import { Tenant } from '../entities/tenant';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testTenants } from '../../test/fixtures/testTenants';
import { expect } from 'chai';
import { Repository } from 'typeorm';

describe('TenantService', () => {
  let service: TenantService;
  let repository: Repository<Tenant>;

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
    repository = module.get<Repository<Tenant>>(getRepositoryToken(Tenant));

    await loadDatabase({
      Tenant: testTenants,
    });
  });

  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
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

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Tenant with given slug already exists.',
        );
      }
    });
  });

  it('should find all tenants', async () => {
    const allTenants = await service.findAll();

    expect(allTenants).to.be.an('array');
    expect(allTenants.length).to.equal(2);

    // Check the structure of the first item (TenantDto validation)
    const firstTenant = allTenants[0];

    expect(firstTenant).to.have.all.keys('id', 'email', 'slug');
    expect(firstTenant.id).to.be.a('string');
    expect(firstTenant.email).to.be.a('string');
    expect(firstTenant.slug).to.be.a('string');
  });

  describe('update', () => {
    it('should throw error if tenant with given id not found', async () => {
      const nonExistentId = 'aeb51f80-adf0-4316-9b42-10237c14acf6';
      try {
        await service.update(nonExistentId, {
          email: 'updateTenant@gmail.com',
          slug: 'updateTenant',
        });

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Tenant with given id not found.');
      }
    });

    it('should return tenant if fields in updateTenantDto dont differ from tenants', async () => {
      const updatedTenant = await service.update(testTenants[0].id, {
        email: 'test1@dot.com',
        slug: 'test1',
      });

      expect(updatedTenant).to.not.throw;
      expect(updatedTenant.email).to.deep.equal('test1@dot.com');
      expect(updatedTenant.slug).to.deep.equal('test1');
    });

    it('should throw error if updateTenantDto has slug that already exists', async () => {
      try {
        await service.update(testTenants[0].id, {
          email: 'createTenant@gmail.com',
          slug: 'test2',
        });

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Tenant with given slug already exists.',
        );
      }
    });

    it('should update tenant', async () => {
      const tenant = await service.update(testTenants[0].id, {
        email: 'updateTenant@gmail.com',
        slug: 'test1',
      });

      expect(tenant.email).to.deep.equal('updateTenant@gmail.com');
      expect(tenant.slug).to.deep.equal('test1');
    });
  });

  describe('remove', () => {
    it('should throw error if tenant with given id not found', async () => {
      const nonExistentId = 'aeb51f80-adf0-4316-9b42-10237c14acf6';
      try {
        await service.remove(nonExistentId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Tenant with given id not found.');
      }
    });
    it('should remove tenant (update deleted to true), but the record should still exist', async () => {
      await service.remove(testTenants[0].id);

      const allActiveTenants = await service.findAll();
      expect(allActiveTenants.length).to.deep.equal(1);

      const deletedTenantRecordInDb = await repository.findOne({
        where: { id: testTenants[0].id },
      });

      expect(deletedTenantRecordInDb).to.not.be.null;
      expect(deletedTenantRecordInDb?.deleted).to.be.true;
    });
  });

  it('should find tenant dto by id', async () => {
    const nonExistentId = 'aeb51f80-adf0-4316-9b42-10237c14acf6';
    try {
      await service.findDtoById(nonExistentId);

      expect.fail('Should have thrown a NOT_FOUND error but did not');
    } catch (e) {
      expect(e.response).to.deep.equal('Tenant with given id not found.');
    }

    const tenant = await service.findDtoById(testTenants[0].id);

    expect(tenant.email).to.deep.equal('test1@dot.com');
    expect(tenant.slug).to.deep.equal('test1');

    expect(tenant).to.have.all.keys('id', 'email', 'slug');
    expect(tenant.id).to.be.a('string');
    expect(tenant.email).to.be.a('string');
    expect(tenant.slug).to.be.a('string');
  });
});
