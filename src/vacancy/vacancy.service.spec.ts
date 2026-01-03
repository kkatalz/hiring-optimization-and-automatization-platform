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
  EXPECTED__VACANCIES_WITH_SUBM_NUM,
  testVacancies,
} from '../../test/fixtures/testVacancies';
import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { testUsers } from '../../test/fixtures/testUsers';
import { testTenants } from '../../test/fixtures/testTenants';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { CreateVacancyDto } from '../vacancy/dto/createVacancy.dto';
import { VacancyDto } from '../vacancy/dto/vacancy.dto';
import { Repository } from 'typeorm';
import { UpdateVacancyDto } from '../vacancy/dto/updateVacancy.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { UserModule } from '../user/user.module';

describe('VacancyService', () => {
  let service: VacancyService;
  let vacancyRepository: Repository<Vacancy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Vacancy]),
        UserModule,
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
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
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

      const vacanciesWithSubmissionsResult =
        await service.findVacanciesWithSubmissions(superAdmin.id);

      expect(vacanciesWithSubmissionsResult.length).to.equal(
        EXPECTED__VACANCIES_WITH_SUBM_NUM,
      );
    });
    it('should find all vacancies with submissions for recruiter only within their tenant', async () => {
      const recruiter = testUsers[1];

      const vacanciesWithSubmissionsResult =
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

      const vacanciesWithSubmissionsResult =
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
        testVacancies[0],
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
      const removeVacancy = testVacancies[0];

      await service.remove(removeVacancy);

      const totalVacancies = await service.findAll();
      expect(totalVacancies.length).to.equal(EXPECTED__VACANCIES_NUM - 1);

      const vacancyIsNotFound = await vacancyRepository.findOne({
        where: { id: removeVacancy.id },
      });
      expect(vacancyIsNotFound).to.equal(null);
    });
  });
});
