import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { VacancyService } from '../vacancy/vacancy.service';
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
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { Repository } from 'typeorm';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';

describe('VacancyService', () => {
  let service: VacancyService;
  let vacancyRepository: Repository<Vacancy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Vacancy, VacancyQuestion]),
        UserModule,
        QuestionModule,
      ],
      providers: [VacancyService],
    }).compile();

    service = module.get<VacancyService>(VacancyService);
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

  describe('findAllVacanciesThatHaveQuestions', () => {
    it('should find all vacancies that have questions linked', async () => {
      const result = await service.findAllVacanciesThatHaveQuestions();

      expect(result.length).to.equal(
        EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS,
      );
    });
  });
});
