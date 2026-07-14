import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { VacancySubmission } from '../entities/vacancySubmission';
import { SubmissionAnswer } from '../entities/submissionAnswers';
import { VacancyService } from '../vacancy/vacancy.service';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import {
  EXPECTED__VACANCIES_NUM,
  EXPECTED__VACANCIES_WITH_SUBM_NUM,
  testVacancies,
} from '../../test/fixtures/testVacancies';
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { testUsers } from '../../test/fixtures/testUsers';
import { testTenants } from '../../test/fixtures/testTenants';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { testQuestions } from '../../test/fixtures/testQuestions';
import {
  EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
  testVacancyQuestions,
} from '../../test/fixtures/testVacancyQuestions';
import { testSubmissionAnswers } from '../../test/fixtures/testSubmissionAnswers';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { GeneralVacancyDto } from '../vacancy/dto/generalVacancy.dto';
import { Repository } from 'typeorm';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { CandidateProfileModule } from '../candidateProfile/candidateProfile.module';
import { SaplingService } from '../sapling/sapling.service';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { QuestionType } from '../entities/question.enum';
import { Question } from '../entities/question';
import { TimeCommitment, LanguageLevel } from '../entities/hiring.enum';
import { PaginatedResponse } from '../types/pagination';

describe('VacancyService', () => {
  let service: VacancyService;
  let vacancyRepository: Repository<Vacancy>;
  let questionRepository: Repository<Question>;
  let submissionRepository: Repository<VacancySubmission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([
          Vacancy,
          VacancyQuestion,
          VacancySubmission,
          SubmissionAnswer,
        ]),
        UserModule,
        QuestionModule,
        CandidateProfileModule,
      ],
      providers: [
        VacancyService,
        VacancySubmissionService,
        { provide: SaplingService, useValue: { detectAiContent: () => null } },
      ],
    }).compile();

    service = module.get<VacancyService>(VacancyService);
    vacancyRepository = module.get<Repository<Vacancy>>(
      getRepositoryToken(Vacancy),
    );
    questionRepository = module.get<Repository<Question>>(
      getRepositoryToken(Question),
    );
    submissionRepository = module.get<Repository<VacancySubmission>>(
      getRepositoryToken(VacancySubmission),
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

  describe('setup', () => {
    it('should be defined', () => {
      expect(!!service).to.deep.equal(true);
    });
  });

  describe('findVacanciesWithSubmissions', () => {
    it('should find all vacancies with submissions for SuperAdmin', async () => {
      const superAdmin = testUsers[4];

      const vacanciesWithSubmissionsResult: PaginatedResponse<VacancyDto> =
        await service.findVacanciesWithSubmissions(superAdmin.id);

      expect(vacanciesWithSubmissionsResult.data.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
    });
    it('should find all vacancies with submissions for recruiter only within their tenant', async () => {
      const recruiter = testUsers[1];

      const vacanciesWithSubmissionsResult: PaginatedResponse<VacancyDto> =
        await service.findVacanciesWithSubmissions(recruiter.id);

      expect(vacanciesWithSubmissionsResult.data.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult.data[0].tenantId).to.deep.equal(
        recruiter.tenantId,
      );
    });

    it('should find all vacancies with submissions for admin only within their tenant', async () => {
      const admin = testUsers[0];

      const vacanciesWithSubmissionsResult: PaginatedResponse<VacancyDto> =
        await service.findVacanciesWithSubmissions(admin.id);

      expect(vacanciesWithSubmissionsResult.data.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult.data[0].tenantId).to.deep.equal(
        admin.tenantId,
      );
    });

    it('should throw if a Candidate tries to see vacancies with submission', async () => {
      const candidate = testUsers[5];

      try {
        await service.findVacanciesWithSubmissions(candidate.id);
        expect.fail('Should have thrown a FORBIDDEN but did not');
      } catch (e: any) {
        expect(e.response).to.equal(
          'Candidates are not allowed to see if vacancies have submissions.',
        );
      }
    });

    it('should return empty array for recruiter from a tenant with no submissions', async () => {
      // testUsers[3] is a recruiter in tenant[1] which has no vacancy submissions
      const recruiterTenant1 = testUsers[3];

      const result: PaginatedResponse<VacancyDto> =
        await service.findVacanciesWithSubmissions(recruiterTenant1.id);

      expect(result.data).to.deep.equal([]);
    });
  });

  describe('findDtoByVacancyId', () => {
    it('should find vacancy dto by id', async () => {
      const vacancyDtoResult: VacancyDto = await service.findVacancyById(
        testVacancies[0].id,
      );

      expect(vacancyDtoResult.id).to.equal(testVacancies[0].id);
    });

    it('should throw id vacancy is not found', async () => {
      try {
        await service.findVacancyById(nonExistentUUIDId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Vacancy is not found.');
      }
    });
  });

  describe('findAllByTenantId', () => {
    it('should find all vacancies by tenant id within this id', async () => {
      const tenantId = testTenants[0].id;

      const vacanciesDtoResult: PaginatedResponse<VacancyDto> =
        await service.findAllByTenantId(tenantId);

      expect(vacanciesDtoResult.data.length).to.equal(EXPECTED__VACANCIES_NUM);

      vacanciesDtoResult.data.forEach((vacancy) => {
        expect(vacancy.tenantId).to.equal(tenantId);
      });
    });

    it('should return empty array when no vacancies exist for the given tenant', async () => {
      const result = await service.findAllByTenantId(nonExistentUUIDId);
      expect(result.data).to.deep.equal([]);
      expect(result.total).to.equal(0);
    });
  });

  describe('create', () => {
    it('should create and save vacancy', async () => {
      const createVacancyDto: CreateVacancyDto = {
        name: 'Zoo keeper',
        description: 'I want to be zookeper!',
        minSalary: 1000,
        maxSalary: 1100,
      };

      const admin = testUsers[0];

      const createVacancyResult: VacancyDto = await service.create(
        createVacancyDto,
        admin,
      );

      expect(createVacancyResult.name).to.equal(createVacancyDto.name);
      expect(createVacancyResult.description).to.equal(
        createVacancyDto.description,
      );
      expect(createVacancyResult.tenantId).to.equal(admin.tenantId);
      expect(createVacancyResult.createdById).to.equal(admin.id);

      const totalVacancies = await service.findAllWithFilters();
      expect(totalVacancies.data.length).to.equal(EXPECTED__VACANCIES_NUM + 1);
    });

    it('should create vacancy with inline questions that do not yet exist', async () => {
      const createVacancyDto: CreateVacancyDto = {
        name: 'Developer',
        description: 'Full-stack developer position',
        vacancyQuestions: [
          {
            label: 'Do you know TypeScript?',
            type: QuestionType.boolean,
            isRequired: true,
          },
          {
            label: 'Seniority level',
            type: QuestionType.dropdown,
            answerOptions: ['Junior', 'Mid', 'Senior'],
            isRequired: false,
          },
        ],
      };

      const admin = testUsers[0];

      const result: VacancyDto = await service.create(createVacancyDto, admin);

      expect(result.name).to.equal(createVacancyDto.name);
      expect(result.vacancyQuestions).to.be.an('array');
      expect(result.vacancyQuestions!.length).to.equal(2);

      const questionDetails = await service.findAllQuestionsByVacancyId(
        result.id,
      );
      expect(questionDetails.length).to.equal(2);

      const booleanQ = questionDetails.find(
        (q) => q.label === 'Do you know TypeScript?',
      );
      expect(booleanQ).to.not.be.undefined;
      expect(booleanQ!.type).to.equal(QuestionType.boolean);
      expect(booleanQ!.isRequired).to.equal(true);

      const dropdownQ = questionDetails.find(
        (q) => q.label === 'Seniority level',
      );
      expect(dropdownQ).to.not.be.undefined;
      expect(dropdownQ!.type).to.equal(QuestionType.dropdown);
      expect(dropdownQ!.answerOptions).to.deep.equal([
        'Junior',
        'Mid',
        'Senior',
      ]);
      expect(dropdownQ!.isRequired).to.equal(false);
    });

    it('should reuse existing question within tenant instead of creating a duplicate', async () => {
      // testQuestions[0] already exists: { label: 'Do you have a car?', type: boolean, tenant: tenant[0] }
      const existingQuestion = testQuestions[0];
      const admin = testUsers[0]; // belongs to tenant[0]

      const questionsCountBefore = (await questionRepository.find()).length;

      const createVacancyDto: CreateVacancyDto = {
        name: 'Driver position',
        description: 'Needs a car',
        vacancyQuestions: [
          {
            label: existingQuestion.label,
            type: existingQuestion.type,
            isRequired: true,
          },
        ],
      };

      const result: VacancyDto = await service.create(createVacancyDto, admin);

      // The vacancy should be linked to the existing question, not a new one
      const questionDetails = await service.findAllQuestionsByVacancyId(
        result.id,
      );
      expect(questionDetails.length).to.equal(1);
      expect(questionDetails[0].questionId).to.equal(existingQuestion.id);

      // No new question should have been created
      const questionsCountAfter = (await questionRepository.find()).length;
      expect(questionsCountAfter).to.equal(questionsCountBefore);
    });

    it('should create vacancy with inline questions including priority and expectedValue', async () => {
      const createVacancyDto: CreateVacancyDto = {
        name: 'Senior Developer',
        description: 'Senior role',
        vacancyQuestions: [
          {
            label: 'Do you have 5+ years experience?',
            type: QuestionType.boolean,
            isRequired: true,
            priority: 1,
            expectedValue: 'true',
          },
          {
            label: 'Preferred stack',
            type: QuestionType.dropdown,
            answerOptions: ['Node.js', 'Python', 'Java'],
            isRequired: false,
            priority: 2,
            expectedValue: ['Node.js'],
          },
        ],
      };

      const admin = testUsers[0];
      const result = await service.create(createVacancyDto, admin);

      const questionDetails = await service.findAllQuestionsByVacancyId(
        result.id,
      );
      expect(questionDetails.length).to.equal(2);

      const boolQ = questionDetails.find(
        (q) => q.label === 'Do you have 5+ years experience?',
      );
      expect(boolQ!.priority).to.equal(1);
      expect(boolQ!.expectedValue).to.equal('true');

      const dropdownQ = questionDetails.find(
        (q) => q.label === 'Preferred stack',
      );
      expect(dropdownQ!.priority).to.equal(2);
      expect(dropdownQ!.expectedValue).to.deep.equal(['Node.js']);
    });

    it('should throw 400 when inline boolean question has invalid expectedValue', async () => {
      const admin = testUsers[0];

      try {
        await service.create(
          {
            name: 'Test vacancy',
            description: 'desc',
            vacancyQuestions: [
              {
                label: 'Do you have experience?',
                type: QuestionType.boolean,
                isRequired: true,
                expectedValue: 'notBooleanValue',
              },
            ],
          },
          admin,
        );
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          "Expected value for boolean question 'Do you have experience?' must be 'true' or 'false'",
        );
      }
    });

    it('should throw 400 when inline dropdown question has expectedValue not in answerOptions', async () => {
      const admin = testUsers[0];

      try {
        await service.create(
          {
            name: 'Test vacancy',
            description: 'desc',
            vacancyQuestions: [
              {
                label: 'Pick a city',
                type: QuestionType.dropdown,
                answerOptions: ['Kyiv', 'Lviv', 'Odesa'],
                isRequired: true,
                expectedValue: ['Berlin'],
              },
            ],
          },
          admin,
        );
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          "Expected value for dropdown question 'Pick a city' must be one of: Kyiv, Lviv, Odesa",
        );
      }
    });

    it('should create new question when same label exists in a different tenant', async () => {
      // testQuestions[3] exists in tenant[1]: { label: 'Are you available for remote work?', type: boolean }
      const otherTenantQuestion = testQuestions[3];
      const admin = testUsers[0]; // belongs to tenant[0]

      const questionsCountBefore = (await questionRepository.find()).length;

      const createVacancyDto: CreateVacancyDto = {
        name: 'Remote position',
        description: 'Remote work available',
        vacancyQuestions: [
          {
            label: otherTenantQuestion.label,
            type: otherTenantQuestion.type,
            isRequired: false,
          },
        ],
      };

      const result: VacancyDto = await service.create(createVacancyDto, admin);

      const questionDetails = await service.findAllQuestionsByVacancyId(
        result.id,
      );
      expect(questionDetails.length).to.equal(1);
      // Should be a NEW question, not the one from tenant[1]
      expect(questionDetails[0].questionId).to.not.equal(
        otherTenantQuestion.id,
      );

      const questionsCountAfter = (await questionRepository.find()).length;
      expect(questionsCountAfter).to.equal(questionsCountBefore + 1);
    });
  });

  describe('update', () => {
    it('should update vacancy with updateVacancyDto', async () => {
      const updateVacancyDto: UpdateVacancyDto = {
        name: 'Zoo keeper Updated',
        description: 'I want to be zookeper!',
      };

      const updateVacancyResult: VacancyDto = await service.update(
        testVacancies[0].id,
        updateVacancyDto,
      );

      expect(updateVacancyResult.minSalary).to.equal(
        testVacancies[0].minSalary,
      );
      expect(updateVacancyResult.maxSalary).to.equal(
        testVacancies[0].maxSalary,
      );
      expect(updateVacancyResult.name).to.equal(updateVacancyDto.name);
      expect(updateVacancyResult.description).to.equal(
        updateVacancyDto.description,
      );
    });

    it('should only update defined fields and keep others unchanged', async () => {
      const updateVacancyDto: UpdateVacancyDto = {
        name: 'Only name updated',
        description: undefined as any,
      };

      const result: VacancyDto = await service.update(
        testVacancies[0].id,
        updateVacancyDto,
      );

      expect(result.name).to.equal('Only name updated');
      expect(result.minSalary).to.equal(testVacancies[0].minSalary);
      expect(result.maxSalary).to.equal(testVacancies[0].maxSalary);
    });

    it('should throw NOT_FOUND when updating non-existent vacancy', async () => {
      try {
        await service.update(nonExistentUUIDId, {
          name: 'x',
          description: 'y',
        });
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Vacancy is not found.');
        expect(e.status).to.equal(404);
      }
    });

    it('should not modify existing vacancy questions when updating basic fields', async () => {
      const vacancyId = testVacancies[0].id;

      const questionsBefore =
        await service.findAllQuestionsByVacancyId(vacancyId);

      await service.update(vacancyId, {
        name: 'Updated name',
        description: 'Updated desc',
      });

      const questionsAfter =
        await service.findAllQuestionsByVacancyId(vacancyId);

      expect(questionsAfter.length).to.equal(questionsBefore.length);
    });

    it('should recalculate matchScore when expectedValue in vacancy questions changes', async () => {
      // vacancy[1] has a submission with answer 'true' for question[0] (boolean, expectedValue 'true')
      // and question[2] (dropdown, expectedValue 'Bachelor') has no answer
      // Initial score: (1/1 * 1 + 1/2 * 0) / (1/1 + 1/2) * 100 = 66.67
      const vacancyId = testVacancies[1].id;

      // Change expectedValue of question[0] from 'true' to 'false'
      const updateDto: UpdateVacancyDto = {
        name: testVacancies[1].name,
        description: testVacancies[1].description,
        vacancyQuestions: [
          {
            questionId: testQuestions[0].id,
            label: testQuestions[0].label,
            type: testQuestions[0].type,
            isRequired: true,
            priority: 1,
            expectedValue: 'false',
          },
        ],
      };

      await service.update(vacancyId, updateDto);

      // Now answer 'true' !== expected 'false', and no answer for question[2]
      // Score = (1*0 + 0.5*0) / (1 + 0.5) * 100 = 0
      const submission = await submissionRepository.findOne({
        where: { id: testVacancySubmissions[0].id },
      });
      expect(submission!.matchScore).to.equal(0);
    });

    it('should recalculate matchScore when vacancy questions priority changes', async () => {
      const vacancyId = testVacancies[1].id;

      // Change priority of question[0] from 1 to 3 (lower weight)
      const updateDto: UpdateVacancyDto = {
        name: testVacancies[1].name,
        description: testVacancies[1].description,
        vacancyQuestions: [
          {
            questionId: testQuestions[0].id,
            label: testQuestions[0].label,
            type: testQuestions[0].type,
            isRequired: true,
            priority: 3,
            expectedValue: 'true',
          },
          {
            questionId: testQuestions[1].id,
            label: testQuestions[1].label,
            type: testQuestions[1].type,
            isRequired: false,
            priority: 3,
          },
          {
            questionId: testQuestions[2].id,
            label: testQuestions[2].label,
            type: testQuestions[2].type,
            isRequired: true,
            priority: 2,
            expectedValue: ['Bachelor'],
          },
        ],
      };

      await service.update(vacancyId, updateDto);

      // question[0]: weight = 1/3, isMatch = 1 (answer 'true' === expected 'true')
      // question[2]: weight = 1/2, isMatch = 0 (no answer)
      // Score = (1/3*1 + 1/2*0) / (1/3 + 1/2) * 100 = 40
      const submission = await submissionRepository.findOne({
        where: { id: testVacancySubmissions[0].id },
      });

      expect(submission!.matchScore).to.equal(40);
    });

    it('should save recalculated matchScore to DB', async () => {
      const vacancyId = testVacancies[1].id;

      // Change expectedValue so score changes
      const updateDto: UpdateVacancyDto = {
        name: testVacancies[1].name,
        description: testVacancies[1].description,
        vacancyQuestions: [
          {
            questionId: testQuestions[0].id,
            label: testQuestions[0].label,
            type: testQuestions[0].type,
            isRequired: true,
            priority: 1,
            expectedValue: 'false',
          },
          {
            questionId: testQuestions[1].id,
            label: testQuestions[1].label,
            type: testQuestions[1].type,
            isRequired: false,
            priority: 3,
          },
          {
            questionId: testQuestions[2].id,
            label: testQuestions[2].label,
            type: testQuestions[2].type,
            isRequired: true,
            priority: 2,
            expectedValue: ['Bachelor'],
          },
        ],
      };

      await service.update(vacancyId, updateDto);

      // Verify by fetching the vacancy with submissions from scratch
      const vacancy =
        await service.findVacancyByIdWithSubmissionsAndAnswers(vacancyId);

      const submission = vacancy.submissions!.find(
        (s) => s.id === testVacancySubmissions[0].id,
      );

      expect(submission).to.not.be.undefined;
      expect(submission!.matchScore).to.equal(0);
    });

    it('should set needsReclustering to true when match-score-affecting fields are updated', async () => {
      const vacancyId = testVacancies[1].id;

      const updateDto: UpdateVacancyDto = {
        name: testVacancies[1].name,
        description: testVacancies[1].description,
        vacancyQuestions: [
          {
            questionId: testQuestions[0].id,
            label: testQuestions[0].label,
            type: testQuestions[0].type,
            isRequired: true,
            priority: 1,
            expectedValue: 'false',
          },
        ],
      };

      await service.update(vacancyId, updateDto);

      const vacancy = await vacancyRepository.findOne({
        where: { id: vacancyId },
      });
      expect(vacancy!.needsReclustering).to.equal(true);
    });

    it('should not set needsReclustering when only basic fields are updated', async () => {
      const vacancyId = testVacancies[1].id;

      await service.update(vacancyId, {
        name: 'Updated name only',
        description: 'Updated desc only',
      });

      const vacancy = await vacancyRepository.findOne({
        where: { id: vacancyId },
      });
      expect(vacancy!.needsReclustering).to.equal(false);
    });

    it('should not recalculate matchScore when only basic fields are updated', async () => {
      const vacancyId = testVacancies[1].id;

      // Get the current matchScore
      const submissionBefore = await submissionRepository.findOne({
        where: { id: testVacancySubmissions[0].id },
      });
      const scoreBefore = submissionBefore!.matchScore;

      await service.update(vacancyId, {
        name: 'Updated name only',
        description: 'Updated desc only',
      });

      const submissionAfter = await submissionRepository.findOne({
        where: { id: testVacancySubmissions[0].id },
      });

      expect(submissionAfter!.matchScore).to.equal(scoreBefore);
    });

    it('should replace the question set on update, linking newly included questions and unlinking omitted ones', async () => {
      const vacancyId = testVacancies[0].id;
      // questions [0] and [2] are linked to vacancy[0]; question[1] is not.
      const newlyIncluded = testQuestions[1];

      await service.update(vacancyId, {
        name: testVacancies[0].name,
        description: testVacancies[0].description,
        // Only include the newly added question in the update payload
        vacancyQuestions: [
          {
            questionId: newlyIncluded.id,
            label: newlyIncluded.label,
            type: newlyIncluded.type,
            isRequired: true,
          },
        ],
      });

      const questions = await service.findAllQuestionsByVacancyId(vacancyId);

      // Full sync: the payload is the complete desired set, so only the
      // included question remains and the previously linked ones are dropped.
      expect(questions).to.have.lengthOf(1);
      expect(questions[0].label).to.equal(newlyIncluded.label);
      expect(questions[0].isRequired).to.equal(true);
    });

    it('should throw 400 when update includes invalid expectedValue for boolean question', async () => {
      const vacancyId = testVacancies[1].id;

      try {
        await service.update(vacancyId, {
          name: testVacancies[1].name,
          description: testVacancies[1].description,
          vacancyQuestions: [
            {
              questionId: testQuestions[0].id,
              label: testQuestions[0].label,
              type: testQuestions[0].type,
              isRequired: true,
              priority: 1,
              expectedValue: 'notBooleanValue',
            },
          ],
        });
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Expected value for boolean question '${testQuestions[0].label}' must be 'true' or 'false'`,
        );
      }
    });

    it('should throw 400 when update includes invalid expectedValue for dropdown question', async () => {
      const vacancyId = testVacancies[1].id;

      try {
        await service.update(vacancyId, {
          name: testVacancies[1].name,
          description: testVacancies[1].description,
          vacancyQuestions: [
            {
              questionId: testQuestions[2].id,
              label: testQuestions[2].label,
              type: testQuestions[2].type,
              answerOptions: testQuestions[2].answerOptions,
              isRequired: true,
              priority: 2,
              expectedValue: ['InvalidOption'],
            },
          ],
        });
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Expected value for dropdown question '${testQuestions[2].label}' must be one of`,
        );
      }
    });
  });

  describe('remove', () => {
    it('should remove vacancy', async () => {
      const removeVacancyId = testVacancies[0].id;

      await service.remove(removeVacancyId);

      const totalVacancies = await service.findAllWithFilters();
      expect(totalVacancies.data.length).to.equal(EXPECTED__VACANCIES_NUM - 1);

      const vacancyIsNotFound = await vacancyRepository.findOne({
        where: { id: removeVacancyId },
      });
      expect(vacancyIsNotFound).to.equal(null);
    });
  });

  describe('addQuestionToVacancy', () => {
    it('should link a question to a vacancy', async () => {
      const vacancyId = testVacancies[0].id;
      const questionId = testQuestions[1].id;

      const result = await service.addQuestionToVacancy(vacancyId, questionId, {
        isRequired: true,
      });

      expect(result.vacancyId).to.equal(vacancyId);
      expect(result.questionId).to.equal(questionId);
      expect(result.isRequired).to.equal(true);
      expect(result.priority).to.equal(1); // default

      const allVacanciesWithQuestions =
        await service.findAllVacanciesThatHaveQuestions();

      expect(allVacanciesWithQuestions.data.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
    });

    it('should throw 404 when vacancy not found', async () => {
      try {
        await service.addQuestionToVacancy(
          nonExistentUUIDId,
          testQuestions[0].id,
          { isRequired: false },
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Vacancy is not found.');
        expect(e.status).to.equal(404);
      }
    });

    it('should throw 404 when question not found', async () => {
      try {
        await service.addQuestionToVacancy(
          testVacancies[0].id,
          nonExistentUUIDId,
          { isRequired: false },
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Question not found.');
        expect(e.status).to.equal(404);
      }
    });

    it('should throw 409 when question is already linked', async () => {
      const vacancyId = testVacancyQuestions[0].vacancyId;
      const questionId = testVacancyQuestions[0].questionId;

      try {
        await service.addQuestionToVacancy(vacancyId, questionId, {
          isRequired: true,
        });
        expect.fail('Should have thrown a CONFLICT error but did not');
      } catch (e: any) {
        expect(e.response).to.equal(
          'Question is already linked to this vacancy.',
        );
        expect(e.status).to.equal(409);
      }
    });

    it('should throw 400 when vacancy and question belong to different tenants', async () => {
      const vacancyId = testVacancies[0].id;
      const questionId = testQuestions[3].id; // belongs to tenant[1], while vacancy belongs to tenant[0]

      try {
        await service.addQuestionToVacancy(vacancyId, questionId, {
          isRequired: false,
        });
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.response).to.equal(
          `Vacancy and Question belong to different tenants. Vacancy belongs to tenant with ID: ${testVacancies[0].tenantId}, while Question belongs to tenant with ID: ${testQuestions[3].tenantId}.`,
        );
        expect(e.status).to.equal(400);
      }
    });

    it('should save priority and expectedValue when linking a question to a vacancy', async () => {
      const vacancyId = testVacancies[0].id;
      const questionId = testQuestions[1].id;

      const result = await service.addQuestionToVacancy(vacancyId, questionId, {
        isRequired: true,
        priority: 3,
        expectedValue: 'Communication skills',
      });

      expect(result.priority).to.equal(3);
      expect(result.expectedValue).to.equal('Communication skills');
    });

    it('when no priority and expectedValue are provided, should default priority to 1 and expectedValue to null', async () => {
      const vacancyId = testVacancies[0].id;
      const questionId = testQuestions[1].id;

      const result = await service.addQuestionToVacancy(vacancyId, questionId, {
        isRequired: false,
      });

      expect(result.priority).to.equal(1);
      expect(result.expectedValue).to.be.null;
    });

    it('should throw 400 when expectedValue for boolean question is not true or false', async () => {
      const admin = testUsers[0];
      const newVacancy = await service.create(
        { name: 'Test', description: 'desc' },
        admin,
      );

      try {
        await service.addQuestionToVacancy(
          newVacancy.id,
          testQuestions[0].id, // boolean question
          {
            isRequired: true,
            expectedValue: 'notBooleanValue',
          },
        );
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Expected value for boolean question '${testQuestions[0].label}' must be 'true' or 'false'`,
        );
      }
    });

    it('should throw 400 when expectedValue for dropdown question is not one of answerOptions', async () => {
      const admin = testUsers[0];
      const newVacancy = await service.create(
        { name: 'Test', description: 'desc' },
        admin,
      );

      try {
        await service.addQuestionToVacancy(
          newVacancy.id,
          testQuestions[2].id, // dropdown with ['High School', 'Bachelor', 'Master', 'PhD']
          {
            isRequired: false,
            expectedValue: ['InvalidOption'],
          },
        );
        expect.fail('Should have thrown a BAD_REQUEST error but did not');
      } catch (e: any) {
        expect(e.status).to.equal(400);
        expect(e.response.message).to.include(
          `Expected value for dropdown question '${testQuestions[2].label}' must be one of: High School, Bachelor, Master, PhD`,
        );
      }
    });

    it('should accept valid expectedValue for boolean question', async () => {
      const admin = testUsers[0];
      const newVacancy = await service.create(
        { name: 'Test', description: 'desc' },
        admin,
      );

      const result = await service.addQuestionToVacancy(
        newVacancy.id,
        testQuestions[0].id,
        {
          isRequired: true,
          expectedValue: 'true',
        },
      );

      expect(result.expectedValue).to.equal('true');
    });

    it('should accept valid expectedValue for dropdown question', async () => {
      const admin = testUsers[0];
      const newVacancy = await service.create(
        { name: 'Test', description: 'desc' },
        admin,
      );

      const result = await service.addQuestionToVacancy(
        newVacancy.id,
        testQuestions[2].id,
        {
          isRequired: false,
          expectedValue: ['Bachelor'],
        },
      );

      expect(result.expectedValue).to.deep.equal(['Bachelor']);
    });
  });

  describe('removeQuestionFromVacancy', () => {
    it('should remove an existing link', async () => {
      const vacancyId = testVacancyQuestions[0].vacancyId;
      const questionId = testVacancyQuestions[0].questionId;

      await service.removeQuestionFromVacancy(vacancyId, questionId);

      const allVacanciesWithQuestions =
        await service.findAllVacanciesThatHaveQuestions();

      expect(allVacanciesWithQuestions.data.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
    });

    it('should throw 404 when vacancy not found', async () => {
      try {
        await service.removeQuestionFromVacancy(
          nonExistentUUIDId,
          testQuestions[0].id,
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Vacancy is not found.');
        expect(e.status).to.equal(404);
      }
    });

    it('should throw 404 when question not found', async () => {
      try {
        await service.removeQuestionFromVacancy(
          testVacancies[0].id,
          nonExistentUUIDId,
        );
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Question not found.');
        expect(e.status).to.equal(404);
      }
    });

    it('should throw 404 when link does not exist', async () => {
      const vacancyId = testVacancies[0].id;
      const questionId = testQuestions[3].id;

      try {
        await service.removeQuestionFromVacancy(vacancyId, questionId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Question is not linked to this vacancy.');
        expect(e.status).to.equal(404);
      }
    });
  });

  describe('findAllQuestionsByVacancyId', () => {
    it('should return detailed question DTOs for a vacancy', async () => {
      const vacancyId = testVacancies[0].id;

      const result = await service.findAllQuestionsByVacancyId(vacancyId);

      // vacancy[0] is linked to testQuestions[0] and testQuestions[2]
      expect(result.length).to.equal(2);
      expect(result[0]).to.have.property('label');
      expect(result[0]).to.have.property('type');
      expect(result[0]).to.have.property('isRequired');
      expect(result[0]).to.have.property('vacancyId');
      expect(result[0]).to.have.property('questionId');
      expect(result[0]).to.have.property('priority');
      expect(result[0]).to.have.property('expectedValue');
    });

    it('should return empty array for a vacancy with no questions', async () => {
      // Create a vacancy without questions
      const admin = testUsers[0];
      const newVacancy = await service.create(
        { name: 'No questions', description: 'desc' },
        admin,
      );

      const result = await service.findAllQuestionsByVacancyId(newVacancy.id);

      expect(result).to.deep.equal([]);
    });
  });

  describe('findAllVacanciesThatHaveQuestions', () => {
    it('should find all vacancies that have questions linked', async () => {
      const result = await service.findAllVacanciesThatHaveQuestions();

      expect(result.data.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
    });

    it('should filter vacancies with questions by tenantId', async () => {
      const tenantId = testTenants[0].id;

      const result = await service.findAllVacanciesThatHaveQuestions(tenantId);

      expect(result.data.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
      result.data.forEach((v) => expect(v.tenantId).to.equal(tenantId));
    });

    it('should return empty when no vacancies with questions exist for given tenant', async () => {
      const tenantId = testTenants[1].id;

      const result = await service.findAllVacanciesThatHaveQuestions(tenantId);

      expect(result.data).to.deep.equal([]);
    });
  });

  describe('getTenantIdByVacancyId', () => {
    it('should return tenantId for a given vacancy', async () => {
      const result = await service.getTenantIdByVacancyId(testVacancies[0].id);

      expect(result).to.equal(testVacancies[0].tenantId);
    });

    it('should throw NOT_FOUND when vacancy does not exist', async () => {
      try {
        await service.getTenantIdByVacancyId(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.equal('Vacancy is not found.');
        expect(e.status).to.equal(404);
      }
    });
  });

  describe('findAllWithFilters', () => {
    it('should return all vacancies when no filters provided', async () => {
      const result = await service.findAllWithFilters();

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
    });

    it('should scope results to tenant when tenantId is provided', async () => {
      const tenantId = testTenants[0].id;
      const result = await service.findAllWithFilters({}, tenantId);

      expect(result.data.length).to.be.greaterThan(0);
      result.data.forEach((v) => expect(v.tenantId).to.equal(tenantId));
    });

    it('should return empty array when tenantId has no vacancies and filters provided', async () => {
      const result = await service.findAllWithFilters({}, testTenants[1].id);

      expect(result.data).to.deep.equal([]);
    });

    it('should filter by name (case-insensitive partial match)', async () => {
      const result = await service.findAllWithFilters({ name: 'zoo' });

      expect(result.data.length).to.equal(2);
      result.data.forEach((v) =>
        expect(v.name.toLowerCase()).to.include('zoo'),
      );
    });

    it('should filter by name with no match', async () => {
      const result = await service.findAllWithFilters({
        name: 'nonexistent',
      });

      expect(result.data.length).to.equal(0);
    });

    it('should filter by single timeCommitment', async () => {
      const result = await service.findAllWithFilters({
        timeCommitment: [TimeCommitment.FULL_TIME],
      });

      expect(result.data.length).to.equal(1);
      expect(result.data[0].timeCommitment).to.equal(TimeCommitment.FULL_TIME);
    });

    it('should filter by multiple timeCommitment values (OR logic)', async () => {
      const result = await service.findAllWithFilters({
        timeCommitment: [TimeCommitment.FULL_TIME, TimeCommitment.PART_TIME],
      });

      expect(result.data.length).to.equal(2);
    });

    it('should filter by minRequiredExperience (NULLs included)', async () => {
      const result = await service.findAllWithFilters({
        minRequiredExperience: 4,
      });

      // Backend Engineer (5) + Zoo keeper (null) + Zoo keeper helper 1 (null)
      expect(result.data.length).to.equal(3);
      const names = result.data.map((v) => v.name);
      expect(names).to.include('Backend Engineer');
      expect(names).to.include('Zoo keeper');
      expect(names).to.include('Zoo keeper helper 1');
    });

    it('should filter by maxRequiredExperience (NULLs included)', async () => {
      const result = await service.findAllWithFilters({
        maxRequiredExperience: 3,
      });

      // Frontend Developer (3) + Zoo keeper (null) + Zoo keeper helper 1 (null)
      expect(result.data.length).to.equal(3);
      const names = result.data.map((v) => v.name);
      expect(names).to.include('Frontend Developer');
      expect(names).to.include('Zoo keeper');
      expect(names).to.include('Zoo keeper helper 1');
    });

    it('should filter by experience range (NULLs included)', async () => {
      const result = await service.findAllWithFilters({
        minRequiredExperience: 2,
        maxRequiredExperience: 4,
      });

      // Frontend Developer (3) + Zoo keeper (null) + Zoo keeper helper 1 (null)
      expect(result.data.length).to.equal(3);
      const withExp = result.data.filter(
        (v) => v.requiredYearsOfExperience != null,
      );
      expect(withExp.length).to.equal(1);
      expect(withExp[0].requiredYearsOfExperience).to.equal(3);
    });

    it('should filter by minSalary', async () => {
      const result = await service.findAllWithFilters({ minSalary: 2000 });

      // Only "Frontend Developer" (3000-5000) matches
      expect(result.data.length).to.equal(1);
      expect(result.data[0].name).to.equal('Frontend Developer');
    });

    it('should filter by maxSalary', async () => {
      const result = await service.findAllWithFilters({ maxSalary: 800 });

      // "Zoo keeper" (1000-1100) excluded, "Zoo keeper helper 1" (500-700) included
      expect(result.data.length).to.equal(1);
      expect(result.data[0].name).to.equal('Zoo keeper helper 1');
    });

    it('should filter by salary range', async () => {
      const result = await service.findAllWithFilters({
        minSalary: 600,
        maxSalary: 1200,
      });

      // "Zoo keeper" (1000-1100) — range overlaps [600,1200], included
      // "Zoo keeper helper 1" (500-700) — range overlaps [600,1200], included
      // "Frontend Developer" (3000-5000) — min 3000 > 1200, excluded
      // "Backend Engineer" (null, null) — null salary, excluded
      expect(result.data.length).to.equal(2);
    });

    it('should exclude vacancies with null salary when salary filter is set', async () => {
      const result = await service.findAllWithFilters({ minSalary: 1 });

      // "Backend Engineer" has minSalary: null, maxSalary: null — excluded
      const names = result.data.map((v) => v.name);
      expect(names).to.not.include('Backend Engineer');
    });

    it('should filter by tags (at least one match)', async () => {
      const result = await service.findAllWithFilters({
        tags: ['TypeScript'],
      });

      // vacancy[2] has ['React', 'TypeScript', 'Frontend']
      // vacancy[3] has ['Node.js', 'TypeScript', 'Backend']
      expect(result.data.length).to.equal(2);
    });

    it('should filter by tags case-insensitively', async () => {
      const result = await service.findAllWithFilters({
        tags: ['typescript'],
      });

      // vacancy[2] has 'TypeScript', vacancy[3] has 'TypeScript' — both match
      expect(result.data.length).to.equal(2);
    });

    it('should return empty when no tags match', async () => {
      const result = await service.findAllWithFilters({
        tags: ['Rust'],
      });

      expect(result.data.length).to.equal(0);
    });

    it('should filter by language code only', async () => {
      const result = await service.findAllWithFilters({
        languageRequirements: [{ code: 'uk' }],
      });

      // Only "Frontend Developer" requires uk
      expect(result.data.length).to.equal(1);
      expect(result.data[0].name).to.equal('Frontend Developer');
    });

    it('should filter by language code and level', async () => {
      const result = await service.findAllWithFilters({
        languageRequirements: [{ code: 'en', level: LanguageLevel.B2 }],
      });

      // vacancy[2] requires en B2, vacancy[3] requires en C1 (>= B2)
      expect(result.data.length).to.equal(2);
    });

    it('should exclude vacancy when language level is below filter', async () => {
      const result = await service.findAllWithFilters({
        languageRequirements: [{ code: 'en', level: LanguageLevel.C2 }],
      });

      // vacancy[2] requires en B2 (< C2), vacancy[3] requires en C1 (< C2)
      expect(result.data.length).to.equal(0);
    });

    it('should combine multiple filters', async () => {
      const result = await service.findAllWithFilters({
        tags: ['TypeScript'],
        timeCommitment: [TimeCommitment.PART_TIME],
      });

      // Only "Frontend Developer" has TypeScript AND PART_TIME
      expect(result.data.length).to.equal(1);
      expect(result.data[0].name).to.equal('Frontend Developer');
    });

    it('should sort by createdAt ASC', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'createdAt',
        order: 'ASC',
      });

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i].createdAt!).getTime(),
        ).to.be.greaterThanOrEqual(
          new Date(result.data[i - 1].createdAt!).getTime(),
        );
      }
    });

    it('should sort by createdAt DESC', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'createdAt',
        order: 'DESC',
      });

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i].createdAt!).getTime(),
        ).to.be.lessThanOrEqual(
          new Date(result.data[i - 1].createdAt!).getTime(),
        );
      }
    });

    it('should sort by requiredYearsOfExperience DESC', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'requiredYearsOfExperience',
        order: 'DESC',
      });

      // Non-null values should come first in DESC order, nulls last
      const withExp = result.data.filter(
        (v) => v.requiredYearsOfExperience != null,
      );
      for (let i = 1; i < withExp.length; i++) {
        expect(withExp[i].requiredYearsOfExperience!).to.be.lessThanOrEqual(
          withExp[i - 1].requiredYearsOfExperience!,
        );
      }
    });

    it('should sort by minSalary ASC (nulls last)', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'minSalary',
        order: 'ASC',
      });

      // Zoo keeper helper 1: minSalary 500
      // Zoo keeper: minSalary 1000
      // Frontend Developer: minSalary 3000
      // Backend Engineer: minSalary null -> last
      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);

      const names = result.data.map((v) => v.name);
      expect(names[0]).to.equal('Zoo keeper helper 1');
      expect(names[1]).to.equal('Zoo keeper');
      expect(names[2]).to.equal('Frontend Developer');
      expect(names[3]).to.equal('Backend Engineer');
    });

    it('should sort by minSalary DESC (nulls last)', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'minSalary',
        order: 'DESC',
      });

      const names = result.data.map((v) => v.name);
      expect(names[0]).to.equal('Frontend Developer');
      expect(names[1]).to.equal('Zoo keeper');
      expect(names[2]).to.equal('Zoo keeper helper 1');
      expect(names[3]).to.equal('Backend Engineer');
    });

    it('should ignore invalid sort field and return unsorted results', async () => {
      const result = await service.findAllWithFilters({
        sortBy: 'invalidField',
        order: 'ASC',
      });

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
    });

    it('should return empty result when filters match nothing', async () => {
      const result = await service.findAllWithFilters({
        name: 'nonexistent',
        tags: ['Rust'],
        minSalary: 999999,
      });

      expect(result.data.length).to.equal(0);
    });
  });

  describe('findAllWithFiltersPublic', () => {
    it('should return all vacancies when no filters provided', async () => {
      const result = await service.findAllWithFiltersPublic();

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
    });

    it('should not expose sensitive fields', async () => {
      const result = await service.findAllWithFiltersPublic();

      result.data.forEach((vacancy) => {
        expect(vacancy).to.not.have.property('createdById');
        expect(vacancy).to.not.have.property('customWeights');
        expect(vacancy).to.not.have.property('tenantId');
        expect(vacancy).to.not.have.property('submissions');
      });
    });

    it('should apply filters correctly', async () => {
      const result = await service.findAllWithFiltersPublic({
        name: 'zoo',
      });

      expect(result.data.length).to.equal(2);
      result.data.forEach((v) =>
        expect(v.name.toLowerCase()).to.include('zoo'),
      );
    });

    it('should sort correctly', async () => {
      const result = await service.findAllWithFiltersPublic({
        sortBy: 'createdAt',
        order: 'ASC',
      });

      expect(result.data.length).to.equal(EXPECTED__VACANCIES_NUM);
      for (let i = 1; i < result.data.length; i++) {
        expect(
          new Date(result.data[i].createdAt!).getTime(),
        ).to.be.greaterThanOrEqual(
          new Date(result.data[i - 1].createdAt!).getTime(),
        );
      }
    });
  });

  describe('findVacancyByIdForBrowse', () => {
    it('should find vacancy by id', async () => {
      const result: GeneralVacancyDto = await service.findVacancyByIdForBrowse(
        testVacancies[0].id,
      );

      expect(result.id).to.equal(testVacancies[0].id);
      expect(result.name).to.equal(testVacancies[0].name);
    });

    it('should not expose sensitive fields', async () => {
      const result = await service.findVacancyByIdForBrowse(
        testVacancies[0].id,
      );

      expect(result).to.not.have.property('createdById');
      expect(result).to.not.have.property('customWeights');
      expect(result).to.not.have.property('tenantId');
      expect(result).to.not.have.property('submissions');
    });

    it('should not expose expectedValue or priority in vacancyQuestions', async () => {
      const result = await service.findVacancyByIdForBrowse(
        testVacancies[0].id,
      );

      expect(result.vacancyQuestions).to.be.an('array');
      result.vacancyQuestions!.forEach((vq) => {
        expect(vq).to.not.have.property('expectedValue');
        expect(vq).to.not.have.property('priority');
      });
    });

    it('should throw NOT_FOUND for non-existent vacancy', async () => {
      try {
        await service.findVacancyByIdForBrowse(nonExistentUUIDId);
        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e: any) {
        expect(e.response).to.deep.equal('Vacancy is not found.');
        expect(e.status).to.equal(404);
      }
    });
  });
});
