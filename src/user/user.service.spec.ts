import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
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
import { UpdateUserDto } from '../user/dto/updateUser.dto';
import { AuthService } from '../auth/auth.service';
import * as sinon from 'sinon';
import { Repository } from 'typeorm';
import { ChangeEmailDto } from '../user/dto/changeEmail.dto';
import { ChangePasswordDto } from '../user/dto/changePassword.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { CandidateProfile } from '../../src/entities/candidateProfile';
import {
  testCandidatesProfiles,
  TOTAL_CANDIDATES,
} from '../../test/fixtures/testCandidatesProfiles';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { LanguageLevel } from '../../src/entities/hiring.enum';
import { UserService } from './user.service';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { CandidateProfileDto } from './dto/candidateProfile.dto';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([User, CandidateProfile, Tenant]),
        AuthModule,
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    authService = module.get<AuthService>(AuthService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
    });
  });

  afterEach(async () => {
    sinon.restore();
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

    it('should throw if user with provided email in createUserDto already exists within provided tenant', async () => {
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

  describe('create candidate', () => {
    it('should create candidate user', async () => {
      const createCandidateDto: CreateCandidateProfileDto = {
        email: 'createCandidate@gmail.com',
        password: 'createCandidate',
        firstName: 'Candidate FirstName',
        lastName: 'Candidate LastName',
        yearsOfExperience: 5,
        country: 'Country',
        city: 'City',
        languages: [{ code: 'EN', level: LanguageLevel.NATIVE }],
      };

      const result = await service.createCandidate(createCandidateDto);

      expect(result.email).to.equal(createCandidateDto.email);
      expect(result.role).to.equal(UserRole.candidate);
      expect(result.languages).to.deep.equal(createCandidateDto.languages);
      expect(result).to.not.have.property('password');

      const allUsers = await service.findAll();
      expect(allUsers.length).to.equal(EXPECTED_ACTIVE_USERS_NUM + 1);

      const allCandidates = allUsers.filter(
        (user) => user.role === UserRole.candidate,
      );

      expect(allCandidates.length).to.equal(TOTAL_CANDIDATES + 1);
    });

    it('should throw if candidate with provided email, firstName and lastName already exists', async () => {
      const createCandidateDto: CreateCandidateProfileDto = {
        ...testUsers[5],
        ...testCandidatesProfiles[0],
      };

      try {
        await service.createCandidate(createCandidateDto);
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.be.equal(
          'Candidate with given details already exists.',
        );
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

  describe('update superAdmin/admin/recruiter', () => {
    it('should update user by userId', async () => {
      const userRecruiterId = testUsers[1].id;
      const tenantId = testTenants[0].id;

      const updateUserDto: UpdateUserDto = {
        firstName: 'updateRecruiter',
        lastName: 'updateRecruiter',
        role: UserRole.admin,
      };

      const updateResult = await service.update(
        userRecruiterId,
        tenantId,
        updateUserDto,
      );

      expect(updateResult.id).to.deep.equal(userRecruiterId);
      expect(updateResult.firstName).to.deep.equal(updateUserDto.firstName);
      expect(updateResult.lastName).to.deep.equal(updateUserDto.lastName);
      expect(updateResult.role).to.deep.equal(updateUserDto.role);
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

  describe('update candidate profile', () => {
    it('should update candidate profile by candidateId', async () => {
      const updateCandidateProfileDto: UpdateCandidateProfileDto = {
        firstName: 'Updated FirstName',
        yearsOfExperience: 10,
        languages: [
          { code: 'EN', level: LanguageLevel.NATIVE },
          { code: 'FR', level: LanguageLevel.B1 },
        ],
      };

      const updateResult: CandidateProfileDto = await service.updateCandidate(
        testCandidatesProfiles[0].id,
        updateCandidateProfileDto,
      );

      expect(updateResult.firstName).to.deep.equal(
        updateCandidateProfileDto.firstName,
      );
      expect(updateResult.yearsOfExperience).to.deep.equal(
        updateCandidateProfileDto.yearsOfExperience,
      );
      expect(updateResult.languages).to.deep.equal(
        updateCandidateProfileDto.languages,
      );
      expect(updateResult.role).to.equal(UserRole.candidate);

      expect(updateResult.email).to.not.be.undefined;
      expect(updateResult.city).to.not.be.undefined;
    });

    it('should throw error if candidate profile with given id not found', async () => {
      try {
        await service.updateCandidate(nonExistentUUIDId, {});

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Candidate profile with given id not found.',
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

  describe('changeEmail', () => {
    it('should change email', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: 'changeEmail',
      };

      const changeEmailResult = await service.changeEmail(
        testUsers[0].id,
        changeEmailDto,
      );

      expect(changeEmailResult.email).to.deep.equal(changeEmailDto.email);

      expect(changeEmailResult).to.not.have.property('password');
    });

    it('should allow change email if the email from changeEmailDto is the same as current user already has', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      const changeEmailResult = await service.changeEmail(
        testUsers[0].id,
        changeEmailDto,
      );

      expect(changeEmailResult.email).to.equal(testUsers[0].email);
    });

    it('should throw error if user with given id not found', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      try {
        await service.changeEmail(nonExistentUUIDId, changeEmailDto);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });

    it('should throw if user with provided email in changeEmailDto already exists within provided tenant', async () => {
      const changeEmailDto: ChangeEmailDto = {
        email: testUsers[0].email,
      };

      try {
        await service.changeEmail(testUsers[1].id, changeEmailDto);

        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'User with given email already exists. Choose a different email.',
        );
      }
    });
  });

  describe('changePassword', () => {
    it('should change password using AuthService to hash password and save the result', async () => {
      const plainPassword = 'my-plain-password';
      const hashedResult = 'mocked-hash-result';

      const changePasswordDto: ChangePasswordDto = {
        password: plainPassword,
      };

      const hashStub = sinon.stub(authService, 'hash').resolves(hashedResult);

      await service.changePassword(testUsers[0].id, changePasswordDto);

      expect(hashStub.calledOnceWith(plainPassword)).to.be.true;

      const userInDb = await userRepository.findOneBy({ id: testUsers[0].id });
      expect(userInDb?.password).to.equal(hashedResult);
    });

    it('should throw error if user with given id not found', async () => {
      const changePasswordDto: ChangePasswordDto = {
        password: 'changePassword',
      };

      try {
        await service.changePassword(nonExistentUUIDId, changePasswordDto);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });
  });
});
