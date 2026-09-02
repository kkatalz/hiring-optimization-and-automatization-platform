import { InterviewStatus } from '../../src/entities/statuses.enum';
import { Interview } from '../../src/entities/interview';
import { testVacancySubmissions } from './testVacancySubmissions';
import { TENANT_ID } from '../utils';

export const testInterviews: Interview[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    title: 'Technical screen',
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
  // Same submission, earlier date - covers ordering of an interview history
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    title: 'Intro call',
    meetLink: 'https://meet.google.com/zyx-wvut-srq',
    scheduledDate: new Date('2024-06-20T09:00:00Z'),
    durationMinutes: 30,
    submissionId: testVacancySubmissions[0].id,
    tenantId: TENANT_ID,
    interviewersEmails: [],
    candidateEmail: 'candidate@gmail.com',
    notes: 'Short intro call',
    status: InterviewStatus.completed,
    submission: testVacancySubmissions[0],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
