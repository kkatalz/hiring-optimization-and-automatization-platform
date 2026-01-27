import { InterviewStatus } from '../../src/entities/statuses.enum';
import { Interview } from '../../src/entities/interview';
import { testVacancySubmissions } from '../../test/fixtures/testVacancySubmissions';
import { TENANT_ID } from '../utils';

export const testInterviews: Interview[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    scheduledDate: new Date('2024-07-01T10:00:00Z'),
    durationMinutes: 60,
    submissionId: testVacancySubmissions[0].id,
    tenantId: TENANT_ID,
    interviewersEmails: ['interviewer1@gmail.com', 'interviewer2@gmail.com'],
    candidateEmail: 'candidate@gmail.com',
    notes: 'Initial technical interview',
    status: InterviewStatus.scheduled,
    submission: testVacancySubmissions[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
