import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { VacancySubmission } from '../entities/vacancySubmission';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { VacancyService } from '../vacancy/vacancy.service';
import { testTenants } from '../../test/fixtures/testTenants';
import { testUsers } from '../../test/fixtures/testUsers';
import { testVacancies } from '../../test/fixtures/testVacancies';
import {
  EXPECTED_VACANCY_SUBMISSIONS_NUM,
  testVacancySubmissions,
} from '../../test/fixtures/testVacancySubmissions';
import { CreateVacancySubmissionDto } from './dto/createVacancySubmission.dto';
import { expect } from 'chai';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { Question } from '../entities/question';
import { SubmissionAnswer } from '../entities/submissionAnswers';
import { UserService } from '../user/user.service';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import { TenantService } from '../tenant/tenant.service';
import { QuestionService } from '../question/question.service';
import { AuthService } from '../auth/auth.service';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfile } from '../entities/candidateProfile';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { testQuestions } from '../../test/fixtures/testQuestions';
import { testVacancyQuestions } from '../../test/fixtures/testVacancyQuestions';
import { Repository } from 'typeorm';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import { LanguageLevel } from '../entities/hiring.enum';
import { RecruitingFilterDto } from '../recruiting/recruitingFilter.dto';
import { testSubmissionAnswers } from '../../test/fixtures/testAnswers';

describe.only('VacancySubmissionService', () => {
  let service: VacancySubmissionService;
  let vacancyRepository: Repository<Vacancy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([
          VacancySubmission,
          Vacancy,
          VacancyQuestion,
          Question,
          SubmissionAnswer,
          User,
          CandidateProfile,
          Tenant,
        ]),
      ],

      providers: [
        VacancySubmissionService,
        VacancyService,
        QuestionService,
        UserService,
        CandidateProfileService,
        TenantService,
        AuthService,
      ],
    }).compile();

    service = module.get<VacancySubmissionService>(VacancySubmissionService);
    vacancyRepository = module.get<Repository<Vacancy>>(
      getRepositoryToken(Vacancy),
    );

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
      Question: testQuestions,
      VacancyQuestion: testVacancyQuestions,
      SubmissionAnswer: testSubmissionAnswers,
    });
  });

  afterEach(async () => await cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('create', () => {
    it('should create a new vacancy submission to given vacancy', async () => {
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Looking forward to this opportunity!',
        answers: [{ questionId: testQuestions[0].id, value: 'yes' }],
      };

      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      const vacancySubmissionResult: VacancySubmissionDto =
        await service.create(createSubmissionDto, zooKeperVacancyID, userId);

      const expectedVacancySubmissionLength = (
        await service.findAllSubmissionsWithinVacancyWithFilters(
          zooKeperVacancyID,
        )
      ).length;

      expect(expectedVacancySubmissionLength).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM + 1,
      );

      expect(vacancySubmissionResult.candidateId).to.equal(
        '11111111-1111-1111-1111-111111111111',
      );
      expect(vacancySubmissionResult.vacancyId).to.deep.equal(
        zooKeperVacancyID,
      );
    });

    it('should create a submission with valid answers', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // vacancy[1] is linked to testQuestions[0] (boolean, required) and testQuestions[1] (text)
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Great opportunity!',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          {
            questionId: testQuestions[1].id,
            value: 'Communication skills',
          },
        ],
      };

      const result = await service.create(
        createSubmissionDto,
        zooKeperVacancyID,
        userId,
      );

      expect(result.vacancyId).to.equal(zooKeperVacancyID);
    });

    it('should throw BadRequestException when answer references a question not on the vacancy', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // testQuestions[3] belongs to tenant[1] and is NOT linked to vacancy[1]
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Test',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[3].id, value: 'yes' },
        ],
      };

      try {
        await service.create(createSubmissionDto, zooKeperVacancyID, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          'Current vacancy does not have question with id',
        );
      }
    });

    it('should throw BadRequestException when missing required question answers', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // vacancy[1] has testQuestions[0] as required, but we only answer testQuestions[1]
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Test',
        answers: [
          {
            questionId: testQuestions[1].id,
            value: 'Some text answer',
          },
        ],
      };

      try {
        await service.create(createSubmissionDto, zooKeperVacancyID, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          'You must answer all required questions.',
        );
        expect(e.response.missingRequiredQuestions).to.be.an('array');
        expect(e.response.missingRequiredQuestions.length).to.equal(1);
      }
    });
    it('should throw BadRequestException when answers in DTO were not provided, but vacancy has required questions', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Test',
      };

      try {
        await service.create(createSubmissionDto, zooKeperVacancyID, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          'You must answer all required questions.',
        );
        expect(e.response.missingRequiredQuestions).to.be.an('array');
        expect(e.response.missingRequiredQuestions.length).to.equal(1);
      }
    });

    it('should throw BadRequestException when dropdown answer has invalid value', async () => {
      // vacancy[0] is linked to testQuestions[0] (boolean, required) and testQuestions[2] (dropdown)
      const vacancyId = testVacancies[0].id;
      const userId = testUsers[5].id;

      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Test',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          {
            questionId: testQuestions[2].id,
            value: 'InvalidOption',
          },
        ],
      };

      try {
        await service.create(createSubmissionDto, vacancyId, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          'Value in answers for question with id',
        );
      }
    });
  });

  it('should allow adding only those tags that exist on the vacancy', async () => {
    const tags = ['zoo', 'animals'];
    await vacancyRepository.update(testVacancies[1].id, { tags });

    const vacancy = await vacancyRepository.findOneOrFail({
      where: { id: testVacancies[1].id },
    });

    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
      tags,
      answers: [{ questionId: testQuestions[0].id, value: 'yes' }],
    };

    const userId = testUsers[5].id;

    const createSubmissionResult: VacancySubmissionDto = await service.create(
      CreateVacancySubmissionDto,
      vacancy.id,
      userId,
    );

    expect(createSubmissionResult.tags).to.deep.equal(tags);
  });

  it('should not allow to create a submission if candidate has already applied to the vacancy', async () => {
    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
      answers: [{ questionId: testQuestions[0].id, value: 'yes' }],
    };

    const zooKeperVacancyID = testVacancies[1].id;
    const userId = testUsers[6].id;
    try {
      await service.create(
        CreateVacancySubmissionDto,
        zooKeperVacancyID,
        userId,
      );
      expect.fail('Should have thrown a BadRequestException but did not');
    } catch (e) {
      expect(e.response).to.deep.equal({
        statusCode: 400,
        message: 'You have already applied to this vacancy.',
        error: 'Bad Request',
      });
    }
  });

  it('should throw BadRequestException if submission contains tags that do not exist on the applied vacancy', async () => {
    const vacancyTags = ['zoo', 'animals'];
    await vacancyRepository.update(testVacancies[1].id, { tags: vacancyTags });

    const vacancy = await vacancyRepository.findOneOrFail({
      where: { id: testVacancies[1].id },
    });

    const submissionInvalidTags = ['zoo', 'invalidTag'];
    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
      tags: submissionInvalidTags,
      answers: [{ questionId: testQuestions[0].id, value: 'yes' }],
    };

    const userId = testUsers[5].id;

    const invalidTags = submissionInvalidTags.filter(
      (tag) => !vacancyTags.includes(tag),
    );

    try {
      await service.create(CreateVacancySubmissionDto, vacancy.id, userId);
      expect.fail('Should have thrown a BadRequestException but did not');
    } catch (e) {
      expect(e.response).to.deep.equal({
        statusCode: 400,
        message: `Invalid tags: ${invalidTags.join(', ')}. Allowed tags are: ${vacancyTags.join(', ')}.`,
        error: 'Bad Request',
      });
    }
  });

  it('should throw NOT_FOUND error if vacancy does not exist', async () => {
    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
    };

    const userId = testUsers[5].id;
    const zooKeperVacancy = nonExistentUUIDId;

    try {
      await service.create(CreateVacancySubmissionDto, zooKeperVacancy, userId);

      expect.fail('Should have thrown a NOT_FOUND error but did not');
    } catch (e) {
      expect(e.response).to.deep.equal('Vacancy is not found.');
    }
  });

  describe('findAllSubmissionsWithinVacancyWithFilters', () => {
    const vacancyId = testVacancies[1].id;

    it('should return all submissions for a vacancy when no filters are provided', async () => {
      const result =
        await service.findAllSubmissionsWithinVacancyWithFilters(vacancyId);

      expect(result.length).to.equal(EXPECTED_VACANCY_SUBMISSIONS_NUM);
      expect(result[0].vacancyId).to.equal(vacancyId);
    });

    it('should return empty array for a vacancy with no submissions', async () => {
      const vacancyWithNoSubmissions = testVacancies[0].id;

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyWithNoSubmissions,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when candidate meets minYearsOfExperience', async () => {
      const filter: RecruitingFilterDto = { minYearsOfExperience: 5 };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].candidateId).to.equal(testCandidatesProfiles[1].id);
    });

    it('should exclude submissions when candidate does not meet minYearsOfExperience', async () => {
      const filter: RecruitingFilterDto = { minYearsOfExperience: 10 };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when candidate meets maxYearsOfExperience', async () => {
      const filter: RecruitingFilterDto = { maxYearsOfExperience: 10 };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should exclude submissions when candidate exceeds maxYearsOfExperience', async () => {
      const filter: RecruitingFilterDto = { maxYearsOfExperience: 3 };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should filter by experience range (min and max combined)', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        maxYearsOfExperience: 10,
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should return submissions when candidate matches country filter', async () => {
      const filter: RecruitingFilterDto = { countries: ['Ukraine'] };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should exclude submissions when candidate does not match country filter', async () => {
      const filter: RecruitingFilterDto = { countries: ['Germany'] };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when candidate matches city filter', async () => {
      const filter: RecruitingFilterDto = { cities: ['Kyiv'] };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should exclude submissions when candidate does not match city filter', async () => {
      const filter: RecruitingFilterDto = { cities: ['Berlin'] };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when candidate matches language code filter', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'en' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should exclude submissions when candidate does not have required language', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'fr' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when candidate meets language level requirement', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'en', level: LanguageLevel.B2 }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should exclude submissions when candidate does not meet language level requirement', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'de', level: LanguageLevel.C1 }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should filter by level only (any language at or above that level)', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ level: LanguageLevel.C1 }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      // candidate has ukr/NATIVE and en/C1, both >= C1
      expect(result.length).to.equal(1);
    });

    it('should combine multiple filters', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        countries: ['Ukraine'],
        languages: [{ code: 'en', level: LanguageLevel.B2 }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should return empty when one of combined filters does not match', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        countries: ['Germany'],
        languages: [{ code: 'en' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when answer matches filter', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'true' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should return empty when answer value does not match filter', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'false' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions matching all answer filters (AND logic)', async () => {
      const filter: RecruitingFilterDto = {
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          {
            questionId: testQuestions[1].id,
            value: 'I am very dedicated and detail-oriented.',
          },
        ],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should return empty when one of multiple answer filters does not match', async () => {
      const filter: RecruitingFilterDto = {
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[1].id, value: 'non-matching value' },
        ],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when filtering by questionId only (no value)', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should combine experience and answer filters', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        answers: [{ questionId: testQuestions[0].id, value: 'true' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should return empty when experience filter matches but answer filter does not', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        answers: [{ questionId: testQuestions[0].id, value: 'false' }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });
  });
  describe('findAllSubmissionsWithinTenantWithFilters', () => {
    const tenantId = testTenants[0].id;

    it('should return all submissions for a tenant when no filters are provided', async () => {
      const result =
        await service.findAllSubmissionsWithinTenantWithFilters(tenantId);

      expect(result.length).to.equal(EXPECTED_VACANCY_SUBMISSIONS_NUM);
    });

    it('should filter submissions by answer within tenant', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'true' }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should return empty when answer does not match within tenant', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'false' }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should combine candidate filters with answer filters within tenant', async () => {
      const filter: RecruitingFilterDto = {
        minYearsOfExperience: 5,
        answers: [{ questionId: testQuestions[0].id, value: 'true' }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should return submissions when filtering by questionId only (no value)', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should return empty when filtering by questionId that has no answers', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[3].id }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result).to.deep.equal([]);
    });

    it('should throw NOT_FOUND when answer filter references non-existent questionId', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: nonExistentUUIDId, value: 'true' }],
      };

      try {
        await service.findAllSubmissionsWithinTenantWithFilters(
          tenantId,
          filter,
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(404);
        expect(e.response).to.equal('Question not found.');
      }
    });

    it('should filter by language within tenant', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'en' }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result.length).to.equal(1);
    });

    it('should combine language and answer filters within tenant', async () => {
      const filter: RecruitingFilterDto = {
        languages: [{ code: 'en', level: LanguageLevel.B2 }],
        answers: [{ questionId: testQuestions[0].id, value: 'true' }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should return empty for a non-existent tenant', async () => {
      const result =
        await service.findAllSubmissionsWithinTenantWithFilters(
          nonExistentUUIDId,
        );

      expect(result).to.deep.equal([]);
    });
  });

  describe('getTenantIdBySubmissionId', () => {
    it('should return the tenantId for a given submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      const tenantId = await service.getTenantIdBySubmissionId(submissionId);

      expect(tenantId).to.equal(testVacancySubmissions[0].tenantId);
    });

    it('should throw NOT_FOUND when submission does not exist', async () => {
      try {
        await service.getTenantIdBySubmissionId(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Vacancy Submission not found.');
      }
    });
  });

  describe('approve', () => {
    it('should approve a vacancy submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      const approvedVacancySubmission: VacancySubmissionDto =
        await service.approve(submissionId);

      expect(approvedVacancySubmission.status).to.equal(
        VacancySubmissionStatus.approved,
      );
    });

    it('should keep status approved when approving already-approved submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      await service.approve(submissionId);
      const result = await service.approve(submissionId);

      expect(result.status).to.equal(VacancySubmissionStatus.approved);
    });

    it('should approve a previously rejected submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      await service.reject(submissionId);
      const result = await service.approve(submissionId);

      expect(result.status).to.equal(VacancySubmissionStatus.approved);
    });

    it('should throw NOT_FOUND error if vacancy submission does not exist', async () => {
      const nonExistentSubmissionId = nonExistentUUIDId;

      try {
        await service.approve(nonExistentSubmissionId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Vacancy Submission not found.');
      }
    });
  });

  describe('reject', () => {
    it('should reject a vacancy submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      const rejectedVacancySubmission: VacancySubmissionDto =
        await service.reject(submissionId);

      expect(rejectedVacancySubmission.status).to.equal(
        VacancySubmissionStatus.rejected,
      );
    });

    it('should keep status rejected when rejecting already-rejected submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      await service.reject(submissionId);
      const result = await service.reject(submissionId);

      expect(result.status).to.equal(VacancySubmissionStatus.rejected);
    });

    it('should reject a previously approved submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      await service.approve(submissionId);
      const result = await service.reject(submissionId);

      expect(result.status).to.equal(VacancySubmissionStatus.rejected);
    });

    it('should throw NOT_FOUND error if vacancy submission does not exist', async () => {
      const nonExistentSubmissionId = nonExistentUUIDId;

      try {
        await service.reject(nonExistentSubmissionId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Vacancy Submission not found.');
      }
    });
  });
});
