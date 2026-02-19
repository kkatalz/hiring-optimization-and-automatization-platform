import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import {
  testCandidatesProfiles,
  TOTAL_CANDIDATES,
} from '../../test/fixtures/testCandidatesProfiles';
import { testTenants } from '../../test/fixtures/testTenants';
import {
  EXPECTED_ACTIVE_USERS_NUM,
  testUsers,
} from '../../test/fixtures/testUsers';
import { nonExistentUUIDId } from '../../test/utils';
import { AuthModule } from '../auth/auth.module';
import { CandidateProfile } from '../entities/candidateProfile';
import { LanguageLevel, LanguageLevelRank } from '../entities/hiring.enum';
import { UserRole } from '../entities/role.enum';
import { User } from '../entities/user';
import { UserService } from '../user/user.service';
import { CandidateProfileService } from './candidateProfile.service';
import { CandidateProfileDto } from './dto/candidateProfile.dto';
import { CreateCandidateProfileDto } from './dto/createCandidateProfile.dto';
import { UpdateCandidateProfileDto } from './dto/updateCandidateProfile.dto';
import { testVacancies } from '../../test/fixtures/testVacancies';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { Tenant } from '../entities/tenant';

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
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
    });

    afterEach(async () => {
      sinon.restore();
      await cleanDatabase();
    });
  });

  it('should be defined', () => {
    expect(!!candidateProfileService).to.deep.equal(true);
  });

  describe('find all candidate submissions by candidate id', () => {
    it('should find all candidate submissions by candidate id', async () => {
      const candidateSubmissions: CandidateProfileDto =
        await candidateProfileService.findAllCandidateSubmissionsByCandidateId(
          testCandidatesProfiles[1].id,
        );

      expect(candidateSubmissions).to.not.be.undefined;
      expect(candidateSubmissions?.submissions?.length).to.equal(1);
    });

    it('should throw error if candidate profile with given id not found', async () => {
      try {
        await candidateProfileService.findAllCandidateSubmissionsByCandidateId(
          nonExistentUUIDId,
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal(
          'Candidate profile with given ID not found.',
        );
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
          testUsers[5].id,
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
        expect(e.response).to.deep.equal('User with given id not found.');
      }
    });
  });

  describe('find all candidates with filters within tenantId (if provided)', () => {
    it('should find all candidates profiles without filters and without tenantId', async () => {
      const result =
        await candidateProfileService.findAllCandidatesWithFilters();

      expect(result.length).to.equal(TOTAL_CANDIDATES);
    });

    it('should find all candidates profiles with filter: at least with minYearsOfExperience and higher', async () => {
      const minYearsOfExperience = testCandidatesProfiles[0].yearsOfExperience;

      const result = await candidateProfileService.findAllCandidatesWithFilters(
        {
          minYearsOfExperience,
        },
      );

      expect(result.length).to.equal(TOTAL_CANDIDATES);
      expect(result[0].yearsOfExperience).to.be.greaterThanOrEqual(
        minYearsOfExperience,
      );
      expect(result[1].yearsOfExperience).to.be.greaterThanOrEqual(
        minYearsOfExperience,
      );
    });

    it('should find all candidates profiles with filter: maxYearsOfExperience and lower and city', async () => {
      const maxYearsOfExperience = testCandidatesProfiles[0].yearsOfExperience;

      const result: CandidateProfileDto[] =
        await candidateProfileService.findAllCandidatesWithFilters({
          maxYearsOfExperience,
          cities: ['New York'],
        });

      expect(result.length).to.equal(1);
      expect(result[0].yearsOfExperience).to.be.lessThanOrEqual(
        maxYearsOfExperience,
      );
    });

    it('should find all candidates profiles for given two filters: languageCodes and level higher than minLanguageLevel', async () => {
      const minLanguageLevel = LanguageLevel.C1;
      const minLanguageLevelIndex = LanguageLevelRank.indexOf(minLanguageLevel);
      // update first candidate to have language level that lower than minLanguageLevel (C1) and language code 'en'
      await candidateProfileService.updateCandidate(testUsers[5].id, {
        languages: [{ code: 'en', level: LanguageLevel.B2 }],
      });
      const result: CandidateProfileDto[] =
        await candidateProfileService.findAllCandidatesWithFilters({
          languages: [{ code: 'en', level: minLanguageLevel }],
        });

      expect(result.length).to.equal(1);

      // returns candidate that has 'en' language code
      expect(result[0].languages.some((lang) => lang.code === 'en')).to.equal(
        true,
      );

      // returns candidate that has language level that is greater than or equal to minLanguageLevel (C1)
      expect(
        result[0].languages.some(
          (lang) =>
            lang.level &&
            LanguageLevelRank.indexOf(lang.level) >= minLanguageLevelIndex,
        ),
      ).to.equal(true);
    });
  });

  it('should find all candidates who know language for given languageCode at any level', async () => {
    const result: CandidateProfileDto[] =
      await candidateProfileService.findAllCandidatesWithFilters({
        languages: [{ code: 'en' }],
      });

    expect(result.length).to.equal(2);
  });

  it('should find all candidates who know any language for given languageLevel', async () => {
    const result: CandidateProfileDto[] =
      await candidateProfileService.findAllCandidatesWithFilters({
        languages: [{ level: LanguageLevel.C1 }],
      });

    expect(result.length).to.equal(2);
  });

  it('should find all candidates profiles with filter: country and language code (knows language with given code at any level) WITHIN tenantId', async () => {
    const tenantId = testTenants[0].id;

    const result: CandidateProfileDto[] =
      await candidateProfileService.findAllCandidatesWithFilters(
        {
          countries: ['Ukraine'],
          languages: [{ code: 'en' }],
        },
        tenantId,
      );

    expect(result.length).to.equal(1);
  });

  describe('find candidate profile by user id', () => {
    it('should find candidate profile by user id', async () => {
      const candidateProfile: CandidateProfile =
        await candidateProfileService.findCandidateByUserId(testUsers[5].id);

      expect(candidateProfile).to.not.be.undefined;
      expect(candidateProfile.id).to.equal(testCandidatesProfiles[0].id);
    });

    it('should throw error if candidate profile with given user id not found', async () => {
      try {
        await candidateProfileService.findCandidateByUserId(nonExistentUUIDId);
      } catch (error) {
        expect(error.message).to.equal(
          'Candidate profile with given user ID not found.',
        );
        expect(error.status).to.equal(404);
      }
    });
  });
});
