import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as sinon from 'sinon';
import { Interview } from '../../src/entities/interview';
import { InterviewService } from '../../src/interview/interview.service';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { testInterviews } from '../../test/fixtures/testInterviews';
import { expect } from 'chai';
import {
  InterviewStatus,
  VacancySubmissionStatus,
} from '../entities/statuses.enum';
import { nonExistentInterviewId, TENANT_ID } from '../../test/utils';
import { testTenants } from '../../test/fixtures/testTenants';
import { testUsers } from '../../test/fixtures/testUsers';
import { testVacancies } from '../../test/fixtures/testVacancies';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import { MailService } from '../mail/mail.service';
import { CreateInterviewDto } from './dto/createInterview.dto';
import { UserDto } from '../user/dto/user.dto';
import { UserRole } from '../entities/role.enum';

describe('InterviewService', () => {
  let service: InterviewService;
  let mailSendStub: sinon.SinonStub;
  let vacancySubmissionService: {
    findOneById: sinon.SinonStub;
    setStatus: sinon.SinonStub;
  };

  beforeEach(async () => {
    mailSendStub = sinon.stub().resolves();
    vacancySubmissionService = {
      findOneById: sinon.stub(),
      setStatus: sinon.stub().callsFake((sub, status) => {
        sub.status = status;
        return Promise.resolve(sub);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([Interview]),
      ],
      providers: [
        InterviewService,
        {
          provide: VacancySubmissionService,
          useValue: vacancySubmissionService,
        },
        { provide: MailService, useValue: { send: mailSendStub } },
      ],
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

  afterEach(async () => {
    sinon.restore();
    await cleanDatabase();
  });

  it('should be defined', () => {
    expect(!!service).to.deep.equal(true);
  });

  describe('getAllInterviews', () => {
    it('should return all interviews within viewers tenant', async () => {
      const interviews = await service.getAllInterviews(TENANT_ID);

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
      expect(mailSendStub.called).to.equal(false);
    });

    it('should send cancellation emails when status changes to canceled', async () => {
      const interviewId = testInterviews[0].id;

      await service.updateInterviewStatus(
        interviewId,
        InterviewStatus.canceled,
      );

      const recipients = mailSendStub.getCalls().map((c) => c.args[0].to);
      expect(recipients).to.include(testInterviews[0].candidateEmail);
      for (const email of testInterviews[0].interviewersEmails) {
        expect(recipients).to.include(email);
      }
      const subjects = mailSendStub.getCalls().map((c) => c.args[0].subject);
      expect(subjects[0]).to.contain('canceled');
    });

    it('should not re-notify if status is already canceled', async () => {
      const interviewId = testInterviews[0].id;
      await service.updateInterviewStatus(
        interviewId,
        InterviewStatus.canceled,
      );
      mailSendStub.resetHistory();

      await service.updateInterviewStatus(
        interviewId,
        InterviewStatus.canceled,
      );

      expect(mailSendStub.called).to.equal(false);
    });

    it('should throw NotFoundException if interview does not exist', async () => {
      try {
        await service.updateInterviewStatus(
          nonExistentInterviewId,
          InterviewStatus.canceled,
        );

        expect.fail('Expected NotFoundException was not thrown');
      } catch (error) {
        expect(error.name).to.equal('NotFoundException');
        expect(error.message).to.equal('Interview not found');
      }
    });
  });

  describe('getTenantIdByInterviewId', () => {
    it('should return the tenant ID for a given interview ID', async () => {
      const tenantId = await service.getTenantIdByInterviewId(
        testInterviews[0].id,
      );

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

  describe('scheduleInterview', () => {
    const recruiter: UserDto = {
      id: testUsers[1].id,
      email: testUsers[1].email,
      firstName: testUsers[1].firstName,
      lastName: testUsers[1].lastName,
      role: UserRole.recruiter,
      tenantId: TENANT_ID,
    };

    const futureDate = () => new Date(Date.now() + 1000 * 60 * 60 * 24);

    const buildDto = (
      overrides: Partial<CreateInterviewDto> = {},
    ): CreateInterviewDto => ({
      submissionId: testVacancySubmissions[0].id,
      meetLink: 'https://meet.google.com/new-meet-link',
      scheduledDate: futureDate(),
      durationMinutes: 60,
      interviewersEmails: ['interviewer1@example.com'],
      notes: 'Initial screening',
      ...overrides,
    });

    beforeEach(() => {
      vacancySubmissionService.findOneById.callsFake(() =>
        Promise.resolve({
          ...testVacancySubmissions[0],
          candidateProfile: {
            ...testCandidatesProfiles[1],
            user: testUsers[6],
          },
          vacancy: testVacancies[1],
        }),
      );
    });

    it('should create an interview and notify candidate + interviewers', async () => {
      const dto = buildDto();

      const created = await service.scheduleInterview(dto, recruiter);

      expect(created.id).to.be.a('string');
      expect(created.candidateEmail).to.equal(testUsers[6].email);
      expect(created.status).to.equal(InterviewStatus.scheduled);

      const recipients = mailSendStub.getCalls().map((c) => c.args[0].to);
      expect(recipients).to.include(testUsers[6].email);
      expect(recipients).to.include('interviewer1@example.com');
    });

    it('should reject scheduledDate in the past', async () => {
      const dto = buildDto({ scheduledDate: new Date(Date.now() - 1000) });

      try {
        await service.scheduleInterview(dto, recruiter);
        expect.fail('Expected BadRequestException was not thrown');
      } catch (error) {
        expect(error.name).to.equal('BadRequestException');
      }
    });

    it('should bump pending submission to interviewing', async () => {
      const dto = buildDto();

      await service.scheduleInterview(dto, recruiter);

      expect(vacancySubmissionService.setStatus.calledOnce).to.equal(true);
      expect(vacancySubmissionService.setStatus.firstCall.args[1]).to.equal(
        VacancySubmissionStatus.interviewing,
      );
    });

    it('should NOT change status when submission is already approved/rejected', async () => {
      vacancySubmissionService.findOneById.callsFake(() =>
        Promise.resolve({
          ...testVacancySubmissions[0],
          status: VacancySubmissionStatus.approved,
          candidateProfile: {
            ...testCandidatesProfiles[1],
            user: testUsers[6],
          },
          vacancy: testVacancies[1],
        }),
      );

      await service.scheduleInterview(buildDto(), recruiter);

      expect(vacancySubmissionService.setStatus.called).to.equal(false);
    });

    it('should reject when recruiter belongs to a different tenant', async () => {
      const otherTenantRecruiter: UserDto = {
        ...recruiter,
        tenantId: 'different-tenant-id',
      };

      try {
        await service.scheduleInterview(buildDto(), otherTenantRecruiter);
        expect.fail('Expected ForbiddenException was not thrown');
      } catch (error) {
        expect(error.name).to.equal('ForbiddenException');
      }
    });
  });

  describe('getMyInterviews', () => {
    it('should return interviews where viewer is the candidate (notes hidden)', async () => {
      const candidate: UserDto = {
        id: 'x',
        email: testInterviews[0].candidateEmail,
        firstName: 'C',
        lastName: 'C',
        role: UserRole.candidate,
      };

      const result = await service.getMyInterviews(candidate);

      expect(result).to.have.length(1);
      expect(result[0].id).to.equal(testInterviews[0].id);
      expect(result[0].notes).to.equal(undefined);
    });

    it('should return interviews where viewer is an interviewer in the same tenant (notes visible)', async () => {
      const interviewer: UserDto = {
        id: 'x',
        email: testInterviews[0].interviewersEmails[0],
        firstName: 'I',
        lastName: 'I',
        role: UserRole.recruiter,
        tenantId: TENANT_ID,
      };

      const result = await service.getMyInterviews(interviewer);

      expect(result).to.have.length(1);
      expect(result[0].id).to.equal(testInterviews[0].id);
      expect(result[0].notes).to.equal(testInterviews[0].notes);
    });

    it('should NOT leak interviews to an interviewer-email user from a different tenant', async () => {
      const crossTenantInterviewer: UserDto = {
        id: 'x',
        email: testInterviews[0].interviewersEmails[0],
        firstName: 'I',
        lastName: 'I',
        role: UserRole.recruiter,
        tenantId: '00000000-0000-0000-0000-000000000999',
      };

      const result = await service.getMyInterviews(crossTenantInterviewer);

      expect(result).to.have.length(0);
    });

    it('should return empty when viewer is neither candidate nor interviewer', async () => {
      const stranger: UserDto = {
        id: 'x',
        email: 'noone@example.com',
        firstName: 'N',
        lastName: 'N',
        role: UserRole.recruiter,
        tenantId: TENANT_ID,
      };

      const result = await service.getMyInterviews(stranger);

      expect(result).to.have.length(0);
    });
  });
});
