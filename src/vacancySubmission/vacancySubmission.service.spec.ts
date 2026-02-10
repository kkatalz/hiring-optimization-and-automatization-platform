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
import { UserService } from '../user/user.service';
import { User } from '../entities/user';
import { Tenant } from '../entities/tenant';
import { TenantService } from '../tenant/tenant.service';
import { AuthService } from '../auth/auth.service';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { CandidateProfile } from '../entities/candidateProfile';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { Repository } from 'typeorm';

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
          User,
          CandidateProfile,
          Tenant,
        ]),
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
    vacancyRepository = module.get<Repository<Vacancy>>(
      getRepositoryToken(Vacancy),
    );

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
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
        await service.findAll(testUsers[4].id)
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

  it('should add only those tags that exist on the applied vacancy', async () => {
    const tags = ['zoo', 'animals'];
    await vacancyRepository.update(testVacancies[1].id, { tags });

    const vacancy = await vacancyRepository.findOneOrFail({
      where: { id: testVacancies[1].id },
    });

    const CreateVacancySubmissionDto: CreateVacancySubmissionDto = {
      comment: 'Looking forward to this opportunity!',
      tags,
    };

    const candidate = testUsers[5];

    const createSubmissionResult: VacancySubmissionDto = await service.create(
      CreateVacancySubmissionDto,
      vacancy.id,
      candidate,
    );

    expect(createSubmissionResult.tags).to.deep.equal(tags);
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
    };

    const candidate = testUsers[5];

    const invalidTags = submissionInvalidTags.filter(
      (tag) => !vacancyTags.includes(tag),
    );

    try {
      await service.create(CreateVacancySubmissionDto, vacancy.id, candidate);
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
      const superAdminId = testUsers[4].id;

      const vacancySubmissionsResult: VacancySubmissionDto[] =
        await service.findAll(superAdminId);

      expect(vacancySubmissionsResult.length).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM,
      );
    });

    it('should return vacancy submissions only within viewer tenant if viewer is admin or recruiter', async () => {
      const recruiterId = testUsers[1].id;

      const vacancySubmissionsResult: VacancySubmissionDto[] =
        await service.findAll(recruiterId);
      expect(vacancySubmissionsResult.length).to.equal(
        EXPECTED_VACANCY_SUBMISSIONS_NUM,
      );
    });
  });

  it('should return empty array if viewer is candidate (only admin and superAdmin can view vacancy submissions)', async () => {
    const candidateId = testUsers[5].id;

    const vacancySubmissionsResult: VacancySubmissionDto[] =
      await service.findAll(candidateId);

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

  describe('approve', () => {
    it('should approve a vacancy submission', async () => {
      const submissionId = testVacancySubmissions[0].id;

      const approvedVacancySubmission: VacancySubmissionDto =
        await service.approve(submissionId);

      expect(approvedVacancySubmission.status).to.equal(
        VacancySubmissionStatus.approved,
      );
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
});
