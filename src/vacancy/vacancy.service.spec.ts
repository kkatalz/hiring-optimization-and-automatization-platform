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
import { Repository } from 'typeorm';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { CandidateProfileModule } from '../candidateProfile/candidateProfile.module';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { QuestionType } from '../entities/question.enum';
import { Question } from '../entities/question';

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
      providers: [VacancyService, VacancySubmissionService],
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

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  it('should find all vacancies', async () => {
    const allVacaniesResult = await service.findAll();

    expect(allVacaniesResult.length).to.equal(EXPECTED__VACANCIES_NUM);
    expect(allVacaniesResult[0]).to.not.have.property('createdBy');
  });

  it('should load vacancyQuestions relation in findAll', async () => {
    const allVacancies = await service.findAll();

    const vacancyWithQuestions = allVacancies.find(
      (v) => v.id === testVacancies[0].id,
    );
    expect(vacancyWithQuestions).to.not.be.undefined;
    expect(vacancyWithQuestions!.vacancyQuestions).to.be.an('array');
    expect(vacancyWithQuestions!.vacancyQuestions!.length).to.be.greaterThan(0);
  });

  describe('findVacanciesWithSubmissions', () => {
    it('should find all vacancies with submissions for SuperAdmin', async () => {
      const superAdmin = testUsers[4];

      const vacanciesWithSubmissionsResult: VacancyDto[] =
        await service.findVacanciesWithSubmissions(superAdmin.id);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
    });
    it('should find all vacancies with submissions for recruiter only within their tenant', async () => {
      const recruiter = testUsers[1];

      const vacanciesWithSubmissionsResult: VacancyDto[] =
        await service.findVacanciesWithSubmissions(recruiter.id);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult[0].tenantId).to.deep.equal(
        recruiter.tenantId,
      );
    });

    it('should find all vacancies with submissions for admin only within their tenant', async () => {
      const admin = testUsers[0];

      const vacanciesWithSubmissionsResult: VacancyDto[] =
        await service.findVacanciesWithSubmissions(admin.id);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult[0].tenantId).to.deep.equal(
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

      const result: VacancyDto[] = await service.findVacanciesWithSubmissions(
        recruiterTenant1.id,
      );

      expect(result).to.deep.equal([]);
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

      const vacanciesDtoResult: VacancyDto[] =
        await service.findAllByTenantId(tenantId);

      expect(vacanciesDtoResult.length).to.equal(EXPECTED__VACANCIES_NUM);

      vacanciesDtoResult.forEach((vacancy) => {
        expect(vacancy.tenantId).to.equal(tenantId);
      });
    });

    it('should throw if vacancy by within given provided tenant id is not found', async () => {
      try {
        await service.findAllByTenantId(nonExistentUUIDId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.message).to.deep.equal(
          'No vacancies within provided tenant were found.',
        );
      }
    });
  });

  describe('create', () => {
    it('should create and save vacancy', async () => {
      const createVacancyDto: CreateVacancyDto = {
        name: 'Zoo keeper',
        description: 'I want to be zookeper!',
        salary: '1000-1100 USD',
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

      const totalVacancies = await service.findAll();
      expect(totalVacancies.length).to.equal(EXPECTED__VACANCIES_NUM + 1);
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

      expect(updateVacancyResult.salary).to.equal(testVacancies[0].salary);
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
      expect(result.salary).to.equal(testVacancies[0].salary);
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
            expectedValue: 'Bachelor',
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
            expectedValue: 'Bachelor',
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
  });
  describe('remove', () => {
    it('should remove vacancy', async () => {
      const removeVacancyId = testVacancies[0].id;

      await service.remove(removeVacancyId);

      const totalVacancies = await service.findAll();
      expect(totalVacancies.length).to.equal(EXPECTED__VACANCIES_NUM - 1);

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

      expect(allVacanciesWithQuestions.length).to.equal(
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

      expect(allVacanciesWithQuestions.length).to.equal(
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

      expect(result.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
    });

    it('should filter vacancies with questions by tenantId', async () => {
      const tenantId = testTenants[0].id;

      const result = await service.findAllVacanciesThatHaveQuestions(tenantId);

      expect(result.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
      result.forEach((v) => expect(v.tenantId).to.equal(tenantId));
    });

    it('should return empty when no vacancies with questions exist for given tenant', async () => {
      const tenantId = testTenants[1].id;

      const result = await service.findAllVacanciesThatHaveQuestions(tenantId);

      expect(result).to.deep.equal([]);
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
});
