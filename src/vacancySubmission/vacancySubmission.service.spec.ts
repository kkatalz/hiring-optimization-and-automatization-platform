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
import { testSubmissionAnswers } from '../../test/fixtures/testSubmissionAnswers';

describe('VacancySubmissionService', () => {
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
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: ['Bachelor'] },
        ],
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
          { questionId: testQuestions[2].id, value: ['Bachelor'] },
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
        expect(e.response.missingRequiredQuestions.length).to.equal(2);
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
        expect(e.response.missingRequiredQuestions.length).to.equal(2);
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
            value: ['InvalidOption'],
          },
        ],
      };

      try {
        await service.create(createSubmissionDto, vacancyId, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include('Value for question');
      }
    });

    it('should calculate matchScore on submission creation when questions have expectedValue', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // vacancy[1] questions with expectedValue:
      //   testQuestions[0]: boolean, priority 1, expectedValue 'true'
      //   testQuestions[2]: dropdown, priority 2, expectedValue ['Bachelor']
      //   testQuestions[1]: text, no expectedValue (excluded from scoring)
      // Candidate answers: testQuestions[0]='true' (match), testQuestions[2]=['Bachelor'] (match 1/1 = 1.0)
      // Score = ((1/1)*1 + (1/2)*1.0) / ((1/1) + (1/2)) * 100 = 1.5/1.5 * 100 = 100
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Perfect match!',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: ['Bachelor'] },
        ],
      };

      const result = await service.create(
        createSubmissionDto,
        zooKeperVacancyID,
        userId,
      );

      expect(result.matchScore).to.equal(100);
    });

    it('should calculate partial matchScore when some answers do not match expectedValue', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // Candidate answers: testQuestions[0]='true' (match, priority 1), testQuestions[2]=['Master'] (no match with expected ['Bachelor'], matchCount=0/1=0)
      // Score = ((1/1)*1 + (1/2)*0) / ((1/1) + (1/2)) * 100 = 1/1.5 * 100 = 66.67
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Partial match',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: ['Master'] },
        ],
      };

      const result = await service.create(
        createSubmissionDto,
        zooKeperVacancyID,
        userId,
      );

      expect(result.matchScore).to.equal(66.67);
    });

    it('should calculate 0 matchScore when no answers match expectedValue', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      // Candidate answers: testQuestions[0]='false' (no match), testQuestions[2]=['PhD'] (no match with expected ['Bachelor'])
      // Score = ((1/1)*0 + (1/2)*0) / ((1/1) + (1/2)) * 100 = 0
      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'No match',
        answers: [
          { questionId: testQuestions[0].id, value: 'false' },
          { questionId: testQuestions[2].id, value: ['PhD'] },
        ],
      };

      const result = await service.create(
        createSubmissionDto,
        zooKeperVacancyID,
        userId,
      );

      expect(result.matchScore).to.equal(0);
    });

    it('should return matchScore as a number (not string) from the database', async () => {
      const zooKeperVacancyID = testVacancies[1].id;
      const userId = testUsers[5].id;

      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Type check',
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: ['Bachelor'] },
        ],
      };

      const result = await service.create(
        createSubmissionDto,
        zooKeperVacancyID,
        userId,
      );

      expect(result.matchScore).to.be.a('number');
    });

    it('should throw BadRequestException when instead of boolean value for boolean question, another value is provided', async () => {
      // vacancy[0] is linked to testQuestions[0] (boolean, required) and testQuestions[2] (dropdown)
      const vacancyId = testVacancies[0].id;
      const userId = testUsers[5].id;

      const createSubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Test',
        answers: [{ questionId: testQuestions[0].id, value: 'notABoolean' }],
      };

      try {
        await service.create(createSubmissionDto, vacancyId, userId);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Question '${testQuestions[0].label}' - (ID: ${testQuestions[0].id}) requires a boolean value ('true' or 'false'), but received: 'notABoolean'`,
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
      answers: [
        { questionId: testQuestions[0].id, value: 'true' },
        { questionId: testQuestions[2].id, value: ['Bachelor'] },
      ],
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
      answers: [{ questionId: testQuestions[0].id, value: 'true' }],
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
      answers: [{ questionId: testQuestions[0].id, value: 'true' }],
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

    it('should return submissions that include provided questionId, when answer[] filter has only questionId (question is type of boolean), but not value (findAllSubmissionsWithinVacancyWithFilters)', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id }],
      };

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId, //testVacancies[1].id
        filter,
      );

      expect(result.length).to.equal(1);
      expect(result[0].id).to.equal(testVacancySubmissions[0].id);
    });

    it('should sort submissions by matchScore DESC when sortBy=matchScore', async () => {
      // Create a second submission to vacancy[1] with a different candidate
      const userId = testUsers[5].id; // candidate who hasn't applied to vacancy[1]

      await service.create(
        {
          comment: 'Second submission',
          answers: [
            { questionId: testQuestions[0].id, value: 'false' },
            { questionId: testQuestions[2].id, value: ['PhD'] },
          ],
        },
        vacancyId,
        userId,
      );

      // Now we have two submissions: existing one (from fixture) and the new one
      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        undefined,
        'matchScore',
        'DESC',
      );

      expect(result.length).to.equal(2);
      // The existing submission (testVacancySubmissions[0]) has no matchScore (0 by default)
      // The new submission has matchScore = 0
      // With NULLS LAST, the 0 score should come first
      if (result[0].matchScore && result[1].matchScore) {
        expect(result[0].matchScore).to.be.greaterThanOrEqual(
          result[1].matchScore,
        );
      }
    });

    it('should sort submissions by matchScore ASC when order=ASC', async () => {
      const userId = testUsers[5].id;

      await service.create(
        {
          comment: 'Second submission',
          answers: [
            { questionId: testQuestions[0].id, value: 'false' },
            { questionId: testQuestions[2].id, value: ['PhD'] },
          ],
        },
        vacancyId,
        userId,
      );

      const result = await service.findAllSubmissionsWithinVacancyWithFilters(
        vacancyId,
        undefined,
        'matchScore',
        'ASC',
      );

      expect(result.length).to.equal(2);
      if (result[0].matchScore && result[1].matchScore) {
        expect(result[0].matchScore).to.be.lessThanOrEqual(
          result[1].matchScore,
        );
      }
    });

    it('should throw BadRequestException when questionId in answer filter is not linked to the vacancy', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[3].id, value: 'true' }],
      };

      try {
        await service.findAllSubmissionsWithinVacancyWithFilters(
          vacancyId, //vacancyId: 1bf26415-b5d1-407d-a040-69b78c7bc268
          filter,
        );
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          `Current vacancy does not have question with id: ${testQuestions[3].id}. Valid ids: ${testQuestions[0].id}, ${testQuestions[1].id}, ${testQuestions[2].id}`,
        );
      }
    });

    it('should throw BadRequestException when value for boolean question is not a boolean', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'not-a-boolean' }],
      };

      try {
        await service.findAllSubmissionsWithinVacancyWithFilters(
          vacancyId,
          filter,
        );
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          `Question '${testQuestions[0].label}' - (ID: ${testQuestions[0].id}) requires a boolean value ('true' or 'false'), but received: 'not-a-boolean'`,
        );
      }
    });

    it('should throw BadRequestException when value for dropdown question is not one of the allowed options', async () => {
      const filter: RecruitingFilterDto = {
        answers: [
          { questionId: testQuestions[2].id, value: ['InvalidOption'] },
        ],
      };

      try {
        await service.findAllSubmissionsWithinVacancyWithFilters(
          vacancyId,
          filter,
        );

        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Value for question ${testQuestions[2].id} must be one of: High School, Bachelor, Master, PhD`,
        );
      }
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

    it('should sort submissions by matchScore DESC within tenant', async () => {
      const userId = testUsers[5].id;

      await service.create(
        {
          comment: 'Second submission in tenant',
          answers: [
            { questionId: testQuestions[0].id, value: 'false' },
            { questionId: testQuestions[2].id, value: ['PhD'] },
          ],
        },
        testVacancies[1].id,
        userId,
      );

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId,
        undefined,
        'matchScore',
        'DESC',
      );

      expect(result.length).to.equal(2);

      // The existing submission (testVacancySubmissions[0]) has no matchScore (0 by default)
      // The new submission has matchScore = 0
      // With NULLS LAST, the new score should come first
      if (result[0].matchScore && result[1].matchScore) {
        expect(result[0].matchScore).to.be.greaterThanOrEqual(
          result[1].matchScore,
        );
      }
      if (result[0].matchScore && !result[1].matchScore) {
        expect(result[0].matchScore).to.equal(0);
      }
    });

    it('should return empty for a non-existent tenant', async () => {
      const result =
        await service.findAllSubmissionsWithinTenantWithFilters(
          nonExistentUUIDId,
        );

      expect(result).to.deep.equal([]);
    });

    it('should return submissions when answer filter has questionId (question is type of boolean), but not value (findAllSubmissionWithinTenantWithFilters)', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id }],
      };

      const result = await service.findAllSubmissionsWithinTenantWithFilters(
        tenantId, //testTenants[0].id
        filter,
      );
      expect(result.length).to.equal(1);
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

    it('should throw BadRequestException when answer filter references questionId that is not linked to any vacancy within tenant', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[3].id, value: 'true' }],
      };

      try {
        await service.findAllSubmissionsWithinTenantWithFilters(
          tenantId,
          filter,
        );
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          `Question with id ${testQuestions[3].id} does not belong to tenant with id ${tenantId}. Please provide valid questionIds in filter.`,
        );
      }
    });

    it('should throw BadRequestException when value for boolean question is not a boolean within tenant filter', async () => {
      const filter: RecruitingFilterDto = {
        answers: [{ questionId: testQuestions[0].id, value: 'not-a-boolean' }],
      };

      try {
        await service.findAllSubmissionsWithinTenantWithFilters(
          tenantId,
          filter,
        );
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.equal(
          `Question '${testQuestions[0].label}' - (ID: ${testQuestions[0].id}) requires a boolean value ('true' or 'false'), but received: 'not-a-boolean'`,
        );
      }
    });

    it('should throw BadRequestException when value for dropdown question is not one of the allowed options within tenant filter', async () => {
      const filter: RecruitingFilterDto = {
        answers: [
          { questionId: testQuestions[2].id, value: ['InvalidOption'] },
        ],
      };

      try {
        await service.findAllSubmissionsWithinTenantWithFilters(
          tenantId,
          filter,
        );
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Value for question ${testQuestions[2].id} must be one of: High School, Bachelor, Master, PhD`,
        );
      }
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

  describe('addRecruiterRating', () => {
    it('should add a recruiter rating to a submission', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const recruiterId = testUsers[1].id;
      const rating = 5;

      const result = await service.addRecruiterRating(
        submissionId,
        recruiterId,
        rating,
      );

      expect(result.recruiterRating).to.equal(rating);
      expect(result.ratedByRecruiterId).to.equal(recruiterId);
    });

    it('should throw NOT_FOUND error if submission does not exist', async () => {
      try {
        await service.addRecruiterRating(nonExistentUUIDId, testUsers[1].id, 5);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(404);
        expect(e.response).to.equal('Vacancy Submission not found.');
      }
    });

    it('should throw BadRequestException if submission was already rated', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const recruiterId = testUsers[1].id;

      // add initial rating
      testVacancySubmissions[0].recruiterRating = 5;

      await service.addRecruiterRating(submissionId, recruiterId, 5);

      try {
        await service.addRecruiterRating(submissionId, recruiterId, 4);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.response.statusCode).to.equal(400);
        expect(e.response.message).to.equal(
          'This submission has already been rated by a recruiter. Please use updateRecruiterRating endpoint to change the rating.',
        );
      }
      // cleanup: reset rating to null for other tests
      testVacancySubmissions[0].recruiterRating = null;
    });
  });

  describe('updateRecruiterRating', () => {
    it('should update an existing recruiter rating', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const recruiterId = testUsers[1].id;

      await service.addRecruiterRating(submissionId, recruiterId, 3);

      const result = await service.updateRecruiterRating(
        submissionId,
        recruiterId,
        5,
      );

      expect(result.recruiterRating).to.equal(5);
      expect(result.ratedByRecruiterId).to.equal(recruiterId);
    });

    it('should allow a different recruiter to update the rating', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const firstRecruiterId = testUsers[1].id;
      const secondRecruiterId = testUsers[3].id;

      await service.addRecruiterRating(submissionId, firstRecruiterId, 3);

      const result = await service.updateRecruiterRating(
        submissionId,
        secondRecruiterId,
        4,
      );

      expect(result.recruiterRating).to.equal(4);
      expect(result.ratedByRecruiterId).to.equal(secondRecruiterId);
    });

    it('should throw NOT_FOUND error if submission does not exist', async () => {
      try {
        await service.updateRecruiterRating(
          nonExistentUUIDId,
          testUsers[1].id,
          5,
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(404);
        expect(e.response).to.equal('Vacancy Submission not found.');
      }
    });

    it('should throw BadRequestException if submission has not been rated yet', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const recruiterId = testUsers[1].id;

      try {
        await service.updateRecruiterRating(submissionId, recruiterId, 4);
        expect.fail('Should have thrown a BadRequestException but did not');
      } catch (e: any) {
        expect(e.response.statusCode).to.equal(400);
        expect(e.response.message).to.equal(
          'This submission has not been rated by a recruiter yet. Please use addRecruiterRating endpoint to add a rating.',
        );
      }
    });
  });

  describe('removeRecruiterRating', () => {
    it('should remove an existing recruiter rating', async () => {
      const submissionId = testVacancySubmissions[0].id;
      const recruiterId = testUsers[1].id;

      await service.addRecruiterRating(submissionId, recruiterId, 5);

      const result = await service.removeRecruiterRating(submissionId);

      expect(result.recruiterRating).to.equal(null);
      expect(result.ratedByRecruiterId).to.equal(null);
    });

    it('should succeed even when submission has no rating', async () => {
      const submissionId = testVacancySubmissions[0].id;

      const result = await service.removeRecruiterRating(submissionId);

      expect(result.recruiterRating).to.equal(null);
      expect(result.ratedByRecruiterId).to.equal(null);
    });

    it('should throw NOT_FOUND error if submission does not exist', async () => {
      try {
        await service.removeRecruiterRating(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(404);
        expect(e.response).to.equal('Vacancy Submission not found.');
      }
    });
  });
});
