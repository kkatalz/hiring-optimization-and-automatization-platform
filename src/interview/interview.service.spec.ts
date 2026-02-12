import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from '../../src/entities/interview';
import { InterviewService } from '../../src/interview/interview.service';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testInterviews } from '../../test/fixtures/testInterviews';
import { expect } from 'chai';
import { InterviewStatus } from '../entities/statuses.enum';
import { nonExistentInterviewId, TENANT_ID } from '../../test/utils';
import { testTenants } from '../../test/fixtures/testTenants';
import { testUsers } from '../../test/fixtures/testUsers';
import { testVacancies } from '../../test/fixtures/testVacancies';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';

describe('InterviewService', () => {
  let service: InterviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Interview]),
      ],
      providers: [InterviewService],
    }).compile();

    service = module.get<InterviewService>(InterviewService);

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
      Vacancy: testVacancies,
      VacancySubmission: testVacancySubmissions,
      Interview: testInterviews,
    });
  });

  afterEach(async () => await cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('getAllInterviews', () => {
    it('should return all interviews within viewers tenant', async () => {
      const viewersTenantId = TENANT_ID;

      const interviews = await service.getAllInterviews(viewersTenantId);

      expect(interviews).to.have.length(1);
      expect(interviews[0].id).to.equal(testInterviews[0].id);
    });
  });

  describe('updateInterviewStatus', () => {
    it('should update the status and notes of an interview', async () => {
      const interviewId = testInterviews[0].id;
      const newStatus = InterviewStatus.completed;
      const newNotes = 'Interview went well';

      const updatedInterview = await service.updateInterviewStatus(
        interviewId,
        newStatus,
        newNotes,
      );

      expect(updatedInterview.status).to.equal(newStatus);
      expect(updatedInterview.notes).to.equal(newNotes);
    });

    it('should throw NotFoundException if interview does not exist', async () => {
      const newStatus = InterviewStatus.canceled;

      try {
        await service.updateInterviewStatus(nonExistentInterviewId, newStatus);

        expect.fail('Expected NotFoundException was not thrown');
      } catch (error) {
        expect(error.name).to.equal('NotFoundException');
        expect(error.message).to.equal('Interview not found');
      }
    });
  });

  describe('getTenantIdByInterviewId', () => {
    it('should return the tenant ID for a given interview ID', async () => {
      const interviewId = testInterviews[0].id;

      const tenantId = await service.getTenantIdByInterviewId(interviewId);

      expect(tenantId).to.equal(TENANT_ID);
    });

    it('should throw NotFoundException if interview does not exist', async () => {
      try {
        await service.getTenantIdByInterviewId(nonExistentInterviewId);

        expect.fail('Expected NotFoundException was not thrown');
      } catch (error) {
        expect(error.message).to.equal('Interview not found');
      }
    });
  });
});
