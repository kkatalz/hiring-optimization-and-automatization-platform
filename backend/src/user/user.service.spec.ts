import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { expect } from 'chai';
import { Repository } from 'typeorm';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testTenants } from '../../test/fixtures/testTenants';
import {
  EXPECTED_ACTIVE_USERS,
  EXPECTED_ACTIVE_USERS_NUM,
  testUsers,
} from '../../test/fixtures/testUsers';
import { nonExistentUUIDId } from '../../test/utils';
import { AuthModule } from '../auth/auth.module';
import { UserRole } from '../entities/role.enum';
import { Tenant } from '../entities/tenant';
import { User } from '../entities/user';
import { UpdateUserDto } from '../user/dto/updateUser.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;

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
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
    });
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('create superadmin/admin/recruiter', () => {
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

    it('should throw if user with provided email already exists', async () => {
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
        expect(e.response).to.be.equal(
          'User with given email already exists. Choose a different email.',
        );
      }
    });
  });

  describe('findDtoById', () => {
    it('should return dto by user id', async () => {
      const findUserRecruiter = testUsers[1];

      const userDtoResult = await service.findDtoById(findUserRecruiter.id);

      expect(userDtoResult.id).to.be.equal(findUserRecruiter.id);
      expect(userDtoResult.role).to.be.equal(findUserRecruiter.role);
      expect(userDtoResult.tenantId).to.be.deep.equal(
        findUserRecruiter.tenantId,
      );
      expect(userDtoResult).to.have.property('token');
    });

    it('should throw if user with given id not found', async () => {
      try {
        await service.findDtoById(nonExistentUUIDId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
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

  describe('update superAdmin/admin/recruiter', () => {
    it('should update user by userId', async () => {
      const userRecruiterId = testUsers[1].id;
      const tenantId = testTenants[0].id;

      const updateUserDto: UpdateUserDto = {
        firstName: 'updateRecruiter',
        lastName: 'updateRecruiter',
      };

      const updateResult = await service.update(
        userRecruiterId,
        tenantId,
        updateUserDto,
      );

      expect(updateResult.id).to.deep.equal(userRecruiterId);
      expect(updateResult.firstName).to.deep.equal(updateUserDto.firstName);
      expect(updateResult.lastName).to.deep.equal(updateUserDto.lastName);
      expect(updateResult.role).to.deep.equal(testUsers[1].role);
      expect(updateResult.tenantId).to.deep.equal(tenantId);
      expect(updateResult).to.have.property('token');
    });

    it('should throw error if user with given id not found', async () => {
      const updateUserDto = {
        firstName: 'updateName',
      };

      try {
        await service.update(
          nonExistentUUIDId,
          testTenants[0].id,
          updateUserDto,
        );

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });

    it('should throw error if provided tenant id does not exist', async () => {
      const updateUserDto = {
        firstName: 'updateName',
      };

      try {
        await service.update(testUsers[1].id, nonExistentUUIDId, updateUserDto);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Tenant does not exist.');
      }
    });

    it('should throw error if user doesnt exist within provided tenant', async () => {
      const updateUserDto = {
        firstName: 'updateName',
      };

      try {
        await service.update(testUsers[1].id, testTenants[1].id, updateUserDto);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'User with given id does not exist within provided tenant.',
        );
      }
    });
  });

  describe('remove', () => {
    it('should remove user (update deleted to true), but the record should still exist', async () => {
      const deleteUserWithId = testUsers[1].id;

      await service.remove(deleteUserWithId, testTenants[0].id);

      const allUsers = await service.findAll();
      expect(allUsers.length).to.equal(EXPECTED_ACTIVE_USERS_NUM - 1);

      const deletedUserRecordInDb = await userRepository.findOne({
        where: { id: deleteUserWithId },
      });

      expect(deletedUserRecordInDb).to.not.be.null;
      expect(deletedUserRecordInDb?.deleted).to.be.true;
    });

    it('should throw error if user with given id not found', async () => {
      try {
        await service.remove(nonExistentUUIDId, testTenants[0].id);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });

    it('should throw if tenantId in remove does not exist', async () => {
      try {
        await service.remove(testUsers[1].id, nonExistentUUIDId);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.equal('Tenant does not exist.');
      }
    });

    it('should throw error if user doesnt exist within provided tenant', async () => {
      try {
        await service.remove(testUsers[1].id, testTenants[1].id);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'User with given id does not exist within provided tenant.',
        );
      }
    });
  });

  describe('changeRole', () => {
    it('should change user role', async () => {
      const userId = testUsers[1].id;

      const result = await service.changeRole(userId, UserRole.admin);

      expect(result.id).to.equal(userId);
      expect(result.role).to.equal(UserRole.admin);
    });

    it('should throw error if user with given id not found', async () => {
      try {
        await service.changeRole(nonExistentUUIDId, UserRole.admin);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });
  });
});
