import type { InterviewStatus } from './statuses.enum';
import type { VacancySubmission } from './vacancySubmission';

export interface Interview {
  id: string;
  meetLink: string;
  scheduledDate: string;
  durationMinutes: number;
  submissionId: string;
  tenantId: string;
  interviewersEmails: string[];
  candidateEmail: string;
  notes: string;
  status: InterviewStatus;
  submission: VacancySubmission;
  createdAt: string;
  updatedAt: string;
}
