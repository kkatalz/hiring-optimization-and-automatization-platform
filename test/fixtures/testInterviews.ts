import {
  InterviewStatus,
  VacancySubmissionStatus,
} from '../../src/entities/status.enum';
import { Interview } from '../../src/entities/interview';
import { VacancySubmission } from '../../src/entities/vacancySubmission';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { testUsers } from '../../test/fixtures/testUsers';
import { ADMIN_ID, TENANT_ID } from '../utils';

const VACANCY = {
  id: '1bf26415-b5d1-407d-a040-69b78c7bc268',
  name: 'Zoo keeper helper 1',
  description: '',
  salary: '500-700 USD',
  tenantId: TENANT_ID,
  createdById: ADMIN_ID,
  submissions: [testVacancySubmissions[0]],
};

const SUBMISSION: VacancySubmission = {
  id: '0899dc13-fab7-4041-b99c-9865925588f9',
  comment: 'I want to work!',
  vacancyId: 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e',
  tenantId: TENANT_ID,
  candidateId: testUsers[5].id,
  status: VacancySubmissionStatus.pending,
  vacancy: VACANCY,
  candidate: testUsers[5],
};

export const testInterviews: Interview[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    scheduledDate: new Date('2024-07-01T10:00:00Z'),
    durationMinutes: 60,
    submissionId: SUBMISSION.id,
    tenantId: TENANT_ID,
    interviewers: ['interviewer1@gmail.com', 'interviewer2@gmail.com'],
    candidateEmail: 'candidate@gmail.com',
    notes: 'Initial technical interview',
    status: InterviewStatus.scheduled,
    submission: SUBMISSION,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
