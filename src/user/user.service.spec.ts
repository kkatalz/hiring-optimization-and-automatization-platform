import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { User } from '../entities/user';
import { expect } from 'chai';
import {
  EXPECTED_ACTIVE_USERS,
  EXPECTED_ACTIVE_USERS_NUM,
  testUsers,
} from '../../test/fixtures/testUsers';
import { UserRole } from '../entities/role.enum';
import { testTenants } from '../../test/fixtures/testTenants';
import { Tenant } from '../entities/tenant';
import { CreateUserDto } from './dto/createUser.dto';
import { AuthModule } from '../auth/auth.module';

describe('UserService', () => {
  let service: UserService;
  const nonExistentUUIDId = '00000000-0000-0000-0000-000000000000';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, Tenant]),
        AuthModule,
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
    });
  });

  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('create', () => {
    it('should create user superAdmin', async () => {
      const tenantId = testTenants[0].id;

      const createUserDto: CreateUserDto = {
        email: 'createUser@gmail.com',
        password: 'createUser',
        firstName: 'John',
        lastName: 'Doe',
        tenantId,
      };
      const targetRole = UserRole.superAdmin;
      const result = await service.create(createUserDto, targetRole);

      expect(result.email).to.equal(createUserDto.email);
      expect(result.tenantId).to.equal(tenantId);
      expect(result.role).to.equal(targetRole);
      expect(result).to.not.have.property('password');
      expect(result).to.have.property('token');

      const allUsers = await service.findAll();
      expect(allUsers.length).to.equal(EXPECTED_ACTIVE_USERS_NUM + 1);
    });

    it('should throw if tenantId in createUserDto does not exist', async () => {
      const dto: CreateUserDto = {
        email: 'noTenant@gmail.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        tenantId: '00000000-0000-0000-0000-000000000000',
      };

      const role = UserRole.superAdmin;

      try {
        await service.create(dto, role);
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal('Tenant does not exist.');
      }
    });

    it('should throw if user with provided email in createUserDto already exists in tenants', async () => {
      const tenantId = testTenants[0].id;

      const dto: CreateUserDto = {
        email: 'test@dot.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        tenantId,
      };

      const role = UserRole.superAdmin;

      try {
        await service.create(dto, role);
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.be.equal('User with given email already exists.');
      }
    });
  });

  describe('findDtoById', () => {
    it('should return dto by user id', async () => {
      const findUserRecruiter = testUsers[1];
      const requesterAdmin = testUsers[0];

      const userDtoResult = await service.findDtoById(
        findUserRecruiter.id,
        requesterAdmin,
      );

      expect(userDtoResult.id).to.be.equal(findUserRecruiter.id);
      expect(userDtoResult.role).to.be.equal(findUserRecruiter.role);
      expect(userDtoResult.tenantId).to.be.deep.equal(
        findUserRecruiter.tenantId,
      );
      expect(userDtoResult).to.have.property('token');
    });

    it('should throw if user with given id not found', async () => {
      const requesterAdmin = testUsers[0];

      try {
        await service.findDtoById(nonExistentUUIDId, requesterAdmin);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });

    it('should throw access forbidden if requesters (admins) tenantId differs from searched users tenantId', async () => {
      const findUserRecruiterWithDifferentTenant = testUsers[3].id;
      const requesterAdmin = testUsers[0];

      try {
        await service.findDtoById(
          findUserRecruiterWithDifferentTenant,
          requesterAdmin,
        );

        expect.fail(
          'Should have thrown a ForbiddenException exception but did not',
        );
      } catch (e) {
        expect(e.response.message).to.deep.equal(
          'You can access users only within your own tenant.',
        );
      }
    });
  });

  it('should find all active users', async () => {
    const allUsers = await service.findAll();

    expect(allUsers.length).to.deep.equal(EXPECTED_ACTIVE_USERS_NUM);
  });

  describe('findAllByTenantId', () => {
    it('should find all active users by tenant id', async () => {
      const tenantId = testTenants[0].id;

      const allUsers = await service.findAllByTenantId(tenantId);

      const expectedActiveUsersNumForProvidedTenantId =
        EXPECTED_ACTIVE_USERS.filter(
          (user) => user.tenantId === tenantId,
        ).length;

      expect(allUsers.length).to.deep.equal(
        expectedActiveUsersNumForProvidedTenantId,
      );
    });
    it('should throw error if provided tenant id does not exist', async () => {
      try {
        await service.findAllByTenantId(nonExistentUUIDId);

        expect.fail('Should have thrown a BAD_REQUEST eror but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Tenant does not exist.');
      }
    });
  });
});

// add check that user (superadmin) can not remove himself
// password can be changed by super and admin. not user himself
// TODO update, remove
