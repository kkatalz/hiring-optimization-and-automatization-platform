import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Vacancy } from '../entities/vacancy';
import { VacancyService } from '../vacancy/vacancy.service';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import {
  EXPECTED__VACANCIES_NUM,
  testVacancies,
} from '../../test/fixtures/testVacancies';
import { Repository } from 'typeorm';
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { testUsers } from '../../test/fixtures/testUsers';
import { testTenants } from '../../test/fixtures/testTenants';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';

describe('VacancyServer', () => {
  let service: VacancyService;
  let repository: Repository<Vacancy>;

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
    repository = module.get<Repository<Vacancy>>(getRepositoryToken(Vacancy));

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
        EXPECTED__VACANCIES_NUM,
      );
    });
    it('should find all vacancies with submissions for recruiter only within their tenant', async () => {
      const recruiter = testUsers[1];

      const vacanciesWithSubmissionsResult =
        await service.findVacanciesWithSubmissions(recruiter);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_NUM,
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
        EXPECTED__VACANCIES_NUM,
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
});
