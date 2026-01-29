import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../../test/database-setup';
import {
  testCandidatesProfiles,
  TOTAL_CANDIDATES,
} from '../../../test/fixtures/testCandidatesProfiles';
import { testTenants } from '../../../test/fixtures/testTenants';
import {
  EXPECTED_ACTIVE_USERS_NUM,
  testUsers,
} from '../../../test/fixtures/testUsers';
import { nonExistentUUIDId } from '../../../test/utils';
import { AuthModule } from '../../auth/auth.module';
import { CandidateProfile } from '../../entities/candidateProfile';
import { LanguageLevel } from '../../entities/hiring.enum';
import { UserRole } from '../../entities/role.enum';
import { Tenant } from '../../entities/tenant';
import { User } from '../../entities/user';
import { UserService } from '../../user/user.service';
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';

describe('CandidateProfileService', () => {
  let candidateProfileService: CandidateProfileService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Tenant, User, CandidateProfile]),
        AuthModule,
      ],
      providers: [CandidateProfileService, UserService],
    }).compile();

    candidateProfileService = module.get<CandidateProfileService>(
      CandidateProfileService,
    );

    userService = module.get<UserService>(UserService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
    });

    afterEach(async () => {
      sinon.restore();
      await cleanDatabase();
    });
  });

  it('should be defined', () => {
    expect(!!candidateProfileService).to.deep.equal(true);
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

      const result =
        await candidateProfileService.createCandidate(createCandidateDto);

      expect(result.email).to.equal(createCandidateDto.email);
      expect(result.role).to.equal(UserRole.candidate);
      expect(result.languages).to.deep.equal(createCandidateDto.languages);
      expect(result).to.not.have.property('password');

      const allUsers = await userService.findAll();
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
        await candidateProfileService.createCandidate(createCandidateDto);
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e).to.have.property('status', 400);
        expect(e.response).to.be.equal(
          'Candidate with given details already exists.',
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

      const updateResult: CandidateProfileDto =
        await candidateProfileService.updateCandidate(
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
        await candidateProfileService.updateCandidate(nonExistentUUIDId, {});

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Candidate profile with given id not found.',
        );
      }
    });
  });
});
