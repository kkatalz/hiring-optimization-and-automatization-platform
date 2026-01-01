import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from '../entities/vacancy';
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

const nonExistentUUIDId = '00000000-0000-0000-0000-000000000000';

describe('VacancyServer', () => {
  let service: VacancyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Vacancy]),
      ],
      providers: [VacancyService],
    }).compile();

    service = module.get<VacancyService>(VacancyService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
    });
  });

  afterEach(() => cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  it('should find all vacancies', async () => {
    const allVacaniesResult = await service.findAll();

    expect(allVacaniesResult.length).to.equal(EXPECTED__VACANCIES_NUM);
    expect(allVacaniesResult).to.not.have.property('createdBy');
  });

  describe('findVacanciesWithSubmissions', () => {
    it('should find all vacancies with submissions for SuperAdmin', async () => {
      const superAdmin = testUsers[4];

      const vacanciesWithSubmissionsResullt =
        await service.findVacanciesWithSubmissions(superAdmin);

      expect(vacanciesWithSubmissionsResullt.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
    });
    it('should find all vacancies with submissions for recruiter only within their tenant', async () => {
      const recruiter = testUsers[1];

      const vacanciesWithSubmissionsResult =
        await service.findVacanciesWithSubmissions(recruiter);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult[0].tenantId).to.deep.equal(
        recruiter.tenantId,
      );
    });

    it('should find all vacancies with submissions for admin only within their tenant', async () => {
      const admin = testUsers[0];

      const vacanciesWithSubmissionsResult =
        await service.findVacanciesWithSubmissions(admin);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
      expect(vacanciesWithSubmissionsResult[0].tenantId).to.deep.equal(
        admin.tenantId,
      );
    });

    it('should throw if a Candidate tries to see vacancies with sumbission', async () => {
      const candidate = testUsers[5];

      try {
        await service.findVacanciesWithSubmissions(candidate);
        expect.fail('Should have thrown a FORBIDDEN but did not');
      } catch (e: any) {
        expect(e.response).to.equal(
          'Candidates are not allowed to see if vacancies have sumbissions.',
        );
      }
    });
  });

  describe('findDtoByVacancyId', () => {
    it('should find vacancy dto by id', async () => {
      const vacancyDtoResult = await service.findDtoByVacancyId(
        testVacancies[0].id,
      );

      expect(vacancyDtoResult.id).to.equal(testVacancies[0].id);

      expect(vacancyDtoResult).to.have.all.keys(
        'id',
        'name',
        'description',
        'salary',
        'tenantId',
        'createdById',
        'submissions',
      );
    });

    it('should throw id vacancy is not found', async () => {
      try {
        await service.findDtoByVacancyId(nonExistentUUIDId);

        expect.fail('Should have thrown a NOT_FOUND error but did not');
      } catch (e) {
        expect(e.response).to.deep.equal('Vacancy is not found.');
      }
    });
  });

  describe('findAllByTenantId', () => {
    it('should find all vacancies by tenant id within this id', async () => {
      const tenantId = testTenants[0].id;

      const vacanciesDtoResult = await service.findAllByTenantId(tenantId);

      expect(vacanciesDtoResult.length).to.equal(EXPECTED__VACANCIES_NUM);

      vacanciesDtoResult.forEach((vacancy) => {
        expect(vacancy).to.have.all.keys(
          'id',
          'name',
          'description',
          'salary',
          'tenantId',
          'createdById',
          'submissions',
        );
      });

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
});
