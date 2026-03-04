import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  cleanDatabase,
  loadDatabase,
  testDatabaseConfig,
} from '../../test/database-setup';
import { expect } from 'chai';
import { Repository } from 'typeorm';

import { ClusteringService } from './clustering.service';
import { SalaryRange } from './types/salaryRange.interface';
import { VacancySubmission } from '../entities/vacancySubmission';
import { Vacancy } from '../entities/vacancy';
import { VacancyQuestion } from '../entities/vacancyQuestion';
import { Question } from '../entities/question';
import { SubmissionAnswer } from '../entities/submissionAnswers';
import { User } from '../entities/user';
import { CandidateProfile } from '../entities/candidateProfile';
import { Tenant } from '../entities/tenant';
import { VacancyService } from '../vacancy/vacancy.service';
import { VacancySubmissionService } from '../vacancySubmission/vacancySubmission.service';
import { QuestionService } from '../question/question.service';
import { UserService } from '../user/user.service';
import { CandidateProfileService } from '../candidateProfile/candidateProfile.service';
import { TenantService } from '../tenant/tenant.service';
import { AuthService } from '../auth/auth.service';
import { QuestionType } from '../entities/question.enum';
import { VacancySubmissionStatus } from '../entities/statuses.enum';
import { VacancyQuestionDetailedDto } from '../vacancy/dto/vacancyQuestionDetailed.dto';

import { testTenants } from '../../test/fixtures/testTenants';
import { testUsers } from '../../test/fixtures/testUsers';
import { testCandidatesProfiles } from '../../test/fixtures/testCandidatesProfiles';
import { testQuestions } from '../../test/fixtures/testQuestions';

// ── Clustering-specific fixtures ──

const CLUSTERING_VACANCY_ID = 'cc000000-cccc-cccc-cccc-000000000001';

const clusteringVacancy: Vacancy = {
  id: CLUSTERING_VACANCY_ID,
  name: 'Clustering Test Vacancy',
  description: 'Vacancy for clustering tests',
  tenantId: testTenants[0].id,
  createdById: testUsers[0].id,
  needsReclustering: false,
  tags: ['React', 'Node', 'Python', 'SQL'],
};

const clusteringSubmissions: VacancySubmission[] = [
  {
    id: 'dd000000-dddd-dddd-dddd-000000000001',
    vacancyId: CLUSTERING_VACANCY_ID,
    tenantId: testTenants[0].id,
    candidateId: testCandidatesProfiles[0].id,
    status: VacancySubmissionStatus.pending,
    tags: ['React', 'SQL'],
    expectedSalary: 50_000,
    createdAt: new Date(),
  } as VacancySubmission,
  {
    id: 'dd000000-dddd-dddd-dddd-000000000002',
    vacancyId: CLUSTERING_VACANCY_ID,
    tenantId: testTenants[0].id,
    candidateId: testCandidatesProfiles[1].id,
    status: VacancySubmissionStatus.pending,
    tags: ['React', 'Node'],
    expectedSalary: 55_000,
    createdAt: new Date(),
  } as VacancySubmission,
  {
    id: 'dd000000-dddd-dddd-dddd-000000000003',
    vacancyId: CLUSTERING_VACANCY_ID,
    tenantId: testTenants[0].id,
    candidateId: testCandidatesProfiles[0].id,
    status: VacancySubmissionStatus.pending,
    tags: ['Python'],
    expectedSalary: 20_000,
    createdAt: new Date(),
  } as VacancySubmission,
];

const clusteringVacancyQuestions: VacancyQuestion[] = [
  {
    vacancyId: CLUSTERING_VACANCY_ID,
    questionId: testQuestions[0].id, // boolean: "Do you have a car?"
    isRequired: true,
    priority: 3,
    expectedValue: 'true',
    vacancy: clusteringVacancy,
    question: testQuestions[0],
  },
  {
    vacancyId: CLUSTERING_VACANCY_ID,
    questionId: testQuestions[2].id, // dropdown: "What is your education level?"
    isRequired: false,
    priority: 1,
    expectedValue: 'Bachelor',
    vacancy: clusteringVacancy,
    question: testQuestions[2],
  },
];

const clusteringAnswers: SubmissionAnswer[] = [
  // Submission 1: license = true, level = PhD
  {
    id: 'ee000000-eeee-eeee-eeee-000000000001',
    submissionId: clusteringSubmissions[0].id,
    questionId: testQuestions[0].id,
    value: 'true',
    submission: clusteringSubmissions[0],
    question: testQuestions[0],
  },
  {
    id: 'ee000000-eeee-eeee-eeee-000000000002',
    submissionId: clusteringSubmissions[0].id,
    questionId: testQuestions[2].id,
    value: 'PhD',
    submission: clusteringSubmissions[0],
    question: testQuestions[2],
  },
  // Submission 2: license = true, level = Master
  {
    id: 'ee000000-eeee-eeee-eeee-000000000003',
    submissionId: clusteringSubmissions[1].id,
    questionId: testQuestions[0].id,
    value: 'true',
    submission: clusteringSubmissions[1],
    question: testQuestions[0],
  },
  {
    id: 'ee000000-eeee-eeee-eeee-000000000004',
    submissionId: clusteringSubmissions[1].id,
    questionId: testQuestions[2].id,
    value: 'Master',
    submission: clusteringSubmissions[1],
    question: testQuestions[2],
  },
  // Submission 3: license = false, level = High School
  {
    id: 'ee000000-eeee-eeee-eeee-000000000005',
    submissionId: clusteringSubmissions[2].id,
    questionId: testQuestions[0].id,
    value: 'false',
    submission: clusteringSubmissions[2],
    question: testQuestions[0],
  },
  {
    id: 'ee000000-eeee-eeee-eeee-000000000006',
    submissionId: clusteringSubmissions[2].id,
    questionId: testQuestions[2].id,
    value: 'High School',
    submission: clusteringSubmissions[2],
    question: testQuestions[2],
  },
];

describe('ClusteringService', () => {
  let service: ClusteringService;
  let submissionRepository: Repository<VacancySubmission>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot(testDatabaseConfig),
        TypeOrmModule.forFeature([
          VacancySubmission,
          Vacancy,
          VacancyQuestion,
          Question,
          SubmissionAnswer,
          User,
          CandidateProfile,
          Tenant,
        ]),
      ],
      providers: [
        ClusteringService,
        VacancyService,
        VacancySubmissionService,
        QuestionService,
        UserService,
        CandidateProfileService,
        TenantService,
        AuthService,
      ],
    }).compile();

    service = module.get<ClusteringService>(ClusteringService);
    submissionRepository = module.get<Repository<VacancySubmission>>(
      getRepositoryToken(VacancySubmission),
    );

    await loadDatabase({
      Tenant: testTenants,
      User: testUsers,
      CandidateProfile: testCandidatesProfiles,
      Vacancy: [clusteringVacancy],
      Question: testQuestions,
      VacancyQuestion: clusteringVacancyQuestions,
      VacancySubmission: clusteringSubmissions,
      SubmissionAnswer: clusteringAnswers,
    });
  });

  afterEach(async () => await cleanDatabase());

  it('should be defined', () => {
    expect(!!service).to.equal(true);
  });

  // ── buildFeatureVector ──

  describe('buildFeatureVector', () => {
    const vacancyQuestions: VacancyQuestionDetailedDto[] = [
      {
        vacancyId: CLUSTERING_VACANCY_ID,
        questionId: testQuestions[0].id,
        isRequired: true,
        priority: 3,
        expectedValue: 'true',
        label: 'Do you have a car?',
        type: QuestionType.boolean,
        answerOptions: undefined,
      },
      {
        vacancyId: CLUSTERING_VACANCY_ID,
        questionId: testQuestions[2].id,
        isRequired: false,
        priority: 1,
        expectedValue: 'Bachelor',
        label: 'What is your education level?',
        type: QuestionType.dropdown,
        answerOptions: ['High School', 'Bachelor', 'Master', 'PhD'],
      },
    ];

    const allTags = ['React', 'Node', 'Python', 'SQL'];
    const salaryRange: SalaryRange = { min: 20_000, max: 100_000 };

    it('should build correct vector for candidate with boolean=true, dropdown=PhD, salary=50000, tags=[React,SQL]', () => {
      const submission = {
        answers: [
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: 'PhD' },
        ],
        expectedSalary: 50_000,
        tags: ['React', 'SQL'],
      } as unknown as VacancySubmission;

      const vector = service.buildFeatureVector(
        submission,
        allTags,
        salaryRange,
        vacancyQuestions,
      );

      // boolean: 1 * (1/3) = 0.333...
      expect(vector[0]).to.be.closeTo(1 / 3, 0.001);

      // dropdown: PhD index=3, value = 3/(4-1) = 1.0, weighted = 1.0 * (1/1) = 1.0
      expect(vector[1]).to.be.closeTo(1.0, 0.001);

      // salary: (50000-20000)/(100000-20000) = 0.375
      expect(vector[2]).to.be.closeTo(0.375, 0.001);

      // tags: React=1, Node=0, Python=0, SQL=1
      expect(vector[3]).to.equal(1);
      expect(vector[4]).to.equal(0);
      expect(vector[5]).to.equal(0);
      expect(vector[6]).to.equal(1);

      expect(vector).to.have.lengthOf(7);
    });

    it('should build correct vector for candidate with boolean=false, dropdown=High School, salary=20000, tags=[Python]', () => {
      const submission = {
        answers: [
          { questionId: testQuestions[0].id, value: 'false' },
          { questionId: testQuestions[2].id, value: 'High School' },
        ],
        expectedSalary: 20_000,
        tags: ['Python'],
      } as unknown as VacancySubmission;

      const vector = service.buildFeatureVector(
        submission,
        allTags,
        salaryRange,
        vacancyQuestions,
      );

      // boolean: 0 * (1/3) = 0
      expect(vector[0]).to.equal(0);
      // dropdown: High School index=0, value = 0/(4-1) = 0, weighted = 0 * 1 = 0
      expect(vector[1]).to.equal(0);
      // salary: (20000-20000)/(100000-20000) = 0
      expect(vector[2]).to.equal(0);
      // tags: React=0, Node=0, Python=1, SQL=0
      expect(vector[3]).to.equal(0);
      expect(vector[4]).to.equal(0);
      expect(vector[5]).to.equal(1);
      expect(vector[6]).to.equal(0);
    });

    it('should use default values when answers are missing', () => {
      const submission = {
        answers: [],
        expectedSalary: null,
        tags: [],
      } as unknown as VacancySubmission;

      const vector = service.buildFeatureVector(
        submission,
        allTags,
        salaryRange,
        vacancyQuestions,
      );

      // boolean missing: default 0, weighted = 0 * (1/3) = 0
      expect(vector[0]).to.equal(0);
      // dropdown missing: default 0.5, weighted = 0.5 * (1/1) = 0.5
      expect(vector[1]).to.be.closeTo(0.5, 0.001);
      // salary null: default 0
      expect(vector[2]).to.equal(0);
      // tags all 0
      expect(vector[3]).to.equal(0);
      expect(vector[4]).to.equal(0);
      expect(vector[5]).to.equal(0);
      expect(vector[6]).to.equal(0);
    });

    it('should handle equal min/max salary range', () => {
      const submission = {
        answers: [],
        expectedSalary: 50_000,
        tags: [],
      } as unknown as VacancySubmission;

      const equalRange: SalaryRange = { min: 50_000, max: 50_000 };

      const vector = service.buildFeatureVector(
        submission,
        allTags,
        equalRange,
        vacancyQuestions,
      );

      // When min === max and salary is not null, use 0.5
      expect(vector[2]).to.equal(0.5);
    });

    it('should skip text questions', () => {
      const questionsWithText: VacancyQuestionDetailedDto[] = [
        {
          vacancyId: CLUSTERING_VACANCY_ID,
          questionId: testQuestions[1].id,
          isRequired: false,
          priority: 1,
          expectedValue: undefined,
          label: 'What is your biggest strength?',
          type: QuestionType.text,
          answerOptions: undefined,
        },
        ...vacancyQuestions,
      ];

      const submission = {
        answers: [
          { questionId: testQuestions[1].id, value: 'I am great' },
          { questionId: testQuestions[0].id, value: 'true' },
          { questionId: testQuestions[2].id, value: 'Bachelor' },
        ],
        expectedSalary: 50_000,
        tags: ['React'],
      } as unknown as VacancySubmission;

      const vector = service.buildFeatureVector(
        submission,
        allTags,
        salaryRange,
        questionsWithText,
      );

      // Vector should still be 7 elements (text is skipped)
      expect(vector).to.have.lengthOf(7);
    });
  });

  // ── clusterSubmissions ──

  describe('clusterSubmissions', () => {
    it('should assign clusterId to all submissions within a vacancy', async () => {
      await service.clusterSubmissions(CLUSTERING_VACANCY_ID);

      const submissions = await submissionRepository.find({
        where: { vacancyId: CLUSTERING_VACANCY_ID },
      });

      for (const sub of submissions) {
        expect(sub.clusterId).to.not.be.null;
        expect(sub.clusterId).to.be.a('number');
      }
    });

    it('should not fail for vacancy with fewer than 2 submissions', async () => {
      // Delete 2 of the 3 submissions so only 1 remains
      await submissionRepository.delete(clusteringSubmissions[1].id);
      await submissionRepository.delete(clusteringSubmissions[2].id);

      // Should complete without error
      await service.clusterSubmissions(CLUSTERING_VACANCY_ID);

      const remaining = await submissionRepository.findOne({
        where: { id: clusteringSubmissions[0].id },
      });

      // clusterId should remain null since clustering requires at least 2
      expect(remaining!.clusterId).to.be.null;
    });

    it('should throw NOT_FOUND for non-existent vacancy', async () => {
      try {
        await service.clusterSubmissions(
          '00000000-0000-0000-0000-000000000000',
        );
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.status).to.equal(404);
      }
    });

    it('should group similar submissions into the same cluster', async () => {
      await service.clusterSubmissions(CLUSTERING_VACANCY_ID);

      const sub1 = await submissionRepository.findOne({
        where: { id: clusteringSubmissions[0].id },
      });
      const sub2 = await submissionRepository.findOne({
        where: { id: clusteringSubmissions[1].id },
      });
      const sub3 = await submissionRepository.findOne({
        where: { id: clusteringSubmissions[2].id },
      });

      // Submissions 1 & 2 are similar (both have license=true, high education, high salary, similar tags)
      // Submission 3 is different (license=false, low education, low salary, different tags)
      expect(sub1!.clusterId).to.equal(sub2!.clusterId);
      expect(sub3!.clusterId).to.not.equal(sub1!.clusterId);
    });
  });

  // ── findSimilar ──

  describe('findSimilar', () => {
    it('should return other submissions in the same cluster', async () => {
      // First, run clustering
      await service.clusterSubmissions(CLUSTERING_VACANCY_ID);

      const sub1 = await submissionRepository.findOne({
        where: { id: clusteringSubmissions[0].id },
      });

      const similar = await service.findSimilar(clusteringSubmissions[0].id);

      // Should not include the submission itself
      const ids = similar.map((s) => s.id);
      expect(ids).to.not.include(clusteringSubmissions[0].id);

      // All returned submissions should have the same clusterId
      for (const s of similar) {
        expect(s.clusterId).to.equal(sub1!.clusterId);
      }
    });

    it('should throw NOT_FOUND for non-existent submission', async () => {
      try {
        await service.findSimilar('00000000-0000-0000-0000-000000000000');
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.status).to.equal(404);
      }
    });

    it('should throw BAD_REQUEST when submission is not clustered yet', async () => {
      try {
        await service.findSimilar(clusteringSubmissions[0].id);
        expect.fail('Should have thrown an error');
      } catch (e: any) {
        expect(e.status).to.equal(400);
      }
    });
  });
});
