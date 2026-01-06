import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { CreateVacancySubmissionDto } from './dto/applyForVacancy.dto';
import { expect } from 'chai';
import { VacancySubmissionDto } from './dto/vacancySubmission.dto';
import { nonExistentUUIDId } from '../../test/utils';
import { Vacancy } from '../entities/vacancy';
import { UserService } from '../user/user.service';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import { TenantService } from '../tenant/tenant.service';
import { AuthService } from '../auth/auth.service';

describe('VacancySubmissionService', () => {
  let service: VacancySubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([VacancySubmission, Vacancy, User, Tenant]),
      ],
      providers: [
        VacancySubmissionService,
        VacancyService,
        UserService,
        TenantService,
        AuthService,
      ],
    }).compile();

    service = module.get<VacancySubmissionService>(VacancySubmissionService);

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

  describe('create', () => {
    it('should create a new vacancy submission', async () => {
      const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
        comment: 'Looking forward to this opportunity!',
      };

      const candidate = testUsers[5];
      const zooKeperVacancyID = testVacancies[0].id;

      const vacancySubmissionResult: VacancySubmissionDto =
        await service.create(
          CreateVacancySubmissionDto,
          zooKeperVacancyID,
          candidate,
        );

      const expectedVacancySubmissionLength = (
        await service.findAll(testUsers[4])
      ).length;

      expect(expectedVacancySubmissionLength).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM + 1,
      );

      expect(vacancySubmissionResult.candidateId).to.equal(candidate.id);
      expect(vacancySubmissionResult.vacancyId).to.deep.equal(
        zooKeperVacancyID,
      );
    });
  });

  it('should throw NOT_FOUND error if vacancy does not exist', async () => {
    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
    };

    const candidate = testUsers[5];
    const zooKeperVacancy = nonExistentUUIDId;

    try {
      await service.create(
        CreateVacancySubmissionDto,
        zooKeperVacancy,
        candidate,
      );

      expect.fail('Should have thrown a NOT_FOUND error but did not');
    } catch (e) {
      expect(e.response).to.deep.equal('Vacancy is not found.');
    }
  });

  describe('findAll', () => {
    it('should return all vacancy submissions if viewer is superAdmin', async () => {
      const superAdmin = testUsers[4];

      const vacancySubmissionsResult: VacancySubmissionDto[] =
        await service.findAll(superAdmin);

      expect(vacancySubmissionsResult.length).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM,
      );
    });

    it('should return vacancy submissions only within viewer tenant if viewer is admin or recruiter', async () => {
      const recruiter = testUsers[1];

      const vacancySubmissionsResult: VacancySubmissionDto[] =
        await service.findAll(recruiter);
      expect(vacancySubmissionsResult.length).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM,
      );
    });
  });

  it('should return empty array if viewer is candidate', async () => {
    const candidate = testUsers[5];

    const vacancySubmissionsResult: VacancySubmissionDto[] =
      await service.findAll(candidate);

    expect(vacancySubmissionsResult.length).to.equal(0);
  });

  describe('findAllByTenantId', () => {
    it('should return all vacancy submissions for a given tenantId (viewer is superAdmin)', async () => {
      const tenantId = testTenants[0].id;

      const vacancySubmissionsResult: VacancySubmissionDto[] =
        await service.findAllByTenantId(tenantId);

      expect(vacancySubmissionsResult.length).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM,
      );
    });
  });
});
