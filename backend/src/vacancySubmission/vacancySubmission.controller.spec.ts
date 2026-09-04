import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import { UserRole } from '../entities/role.enum';
import { UserDto } from '../user/dto/user.dto';
import { VacancyService } from '../vacancy/vacancy.service';
import { MatchScoreExplanationDto } from './dto/matchScoreExplanation.dto';
import { VacancySubmissionController } from './vacancySubmission.controller';
import { VacancySubmissionService } from './vacancySubmission.service';

/**
 * `GET :submissionId/match-score` is open to admins, recruiters, super admins
 * and candidates. Everything that keeps candidate A out of candidate B's
 * breakdown lives in the controller, not the service, so it is tested here
 * against stubbed services rather than against the database.
 */
describe('VacancySubmissionController - showMatchScoreBySubmissionId', () => {
  const SUBMISSION_ID = '0899dc13-fab7-4041-b99c-9865925588f9';
  const TENANT_ID = 'df0787ee-3bd2-49bd-a0aa-de97b112e3b6';
  const OTHER_TENANT_ID = '52995d6e-1ab1-4287-99b7-5dcfe58aba27';

  const OWNER_USER_ID = 'dd8e52b6-f1c9-46ef-afb3-f2d3bcfc70c8';
  const OTHER_CANDIDATE_USER_ID = 'dd8e52b6-f1c9-46ef-afb3-f2d3bcfc70c7';

  const explanation: MatchScoreExplanationDto = {
    matchScore: 72,
    explanation: ['Answers matched 2 of 3 expected values'],
  };

  const buildUser = (role: UserRole, id: string, tenantId?: string): UserDto =>
    ({
      id,
      email: `${id}@dot.com`,
      firstName: 'Test',
      lastName: 'User',
      role,
      tenantId,
    }) as UserDto;

  let controller: VacancySubmissionController;
  let submissionService: {
    getTenantIdBySubmissionId: sinon.SinonStub;
    getCandidateUserIdBySubmissionId: sinon.SinonStub;
    getMatchScoreExplanation: sinon.SinonStub;
  };

  beforeEach(async () => {
    submissionService = {
      getTenantIdBySubmissionId: sinon.stub().resolves(TENANT_ID),
      getCandidateUserIdBySubmissionId: sinon.stub().resolves(OWNER_USER_ID),
      getMatchScoreExplanation: sinon.stub().resolves(explanation),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VacancySubmissionController],
      providers: [
        { provide: VacancySubmissionService, useValue: submissionService },
        { provide: VacancyService, useValue: {} },
        { provide: CandidateProfileService, useValue: {} },
      ],
    }).compile();

    controller = module.get<VacancySubmissionController>(
      VacancySubmissionController,
    );
  });

  it('should return the breakdown to the candidate who owns the submission', async () => {
    const owner = buildUser(UserRole.candidate, OWNER_USER_ID);

    const result = await controller.showMatchScoreBySubmissionId(
      SUBMISSION_ID,
      owner,
    );

    expect(result).to.deep.equal(explanation);
  });

  it('should throw ForbiddenException for a candidate who does not own the submission', async () => {
    const intruder = buildUser(UserRole.candidate, OTHER_CANDIDATE_USER_ID);

    try {
      await controller.showMatchScoreBySubmissionId(SUBMISSION_ID, intruder);
      expect.fail('Should have thrown a ForbiddenException but did not');
    } catch (e: any) {
      expect(e).to.be.instanceOf(ForbiddenException);
      expect(e.message).to.equal(
        'Candidates can view the match score only for their own submissions.',
      );
    }

    expect(submissionService.getMatchScoreExplanation.called).to.equal(false);
  });

  // The service returns `string | undefined`, so an owner it cannot resolve
  // must not be read as "no owner, therefore allowed".
  it('should throw ForbiddenException for a candidate when the owner cannot be resolved', async () => {
    submissionService.getCandidateUserIdBySubmissionId.resolves(undefined);
    const candidate = buildUser(UserRole.candidate, OWNER_USER_ID);

    try {
      await controller.showMatchScoreBySubmissionId(SUBMISSION_ID, candidate);
      expect.fail('Should have thrown a ForbiddenException but did not');
    } catch (e: any) {
      expect(e).to.be.instanceOf(ForbiddenException);
    }

    expect(submissionService.getMatchScoreExplanation.called).to.equal(false);
  });

  it('should return the breakdown to a recruiter of the same tenant without an ownership check', async () => {
    const recruiter = buildUser(
      UserRole.recruiter,
      OTHER_CANDIDATE_USER_ID,
      TENANT_ID,
    );

    const result = await controller.showMatchScoreBySubmissionId(
      SUBMISSION_ID,
      recruiter,
    );

    expect(result).to.deep.equal(explanation);
    expect(submissionService.getCandidateUserIdBySubmissionId.called).to.equal(
      false,
    );
  });

  it('should throw ForbiddenException for a recruiter of another tenant', async () => {
    const outsider = buildUser(
      UserRole.recruiter,
      OTHER_CANDIDATE_USER_ID,
      OTHER_TENANT_ID,
    );

    try {
      await controller.showMatchScoreBySubmissionId(SUBMISSION_ID, outsider);
      expect.fail('Should have thrown a ForbiddenException but did not');
    } catch (e: any) {
      expect(e).to.be.instanceOf(ForbiddenException);
    }

    expect(submissionService.getMatchScoreExplanation.called).to.equal(false);
  });

  it('should return the breakdown to a super admin of any tenant', async () => {
    const superAdmin = buildUser(UserRole.superAdmin, OTHER_CANDIDATE_USER_ID);

    const result = await controller.showMatchScoreBySubmissionId(
      SUBMISSION_ID,
      superAdmin,
    );

    expect(result).to.deep.equal(explanation);
  });
});
