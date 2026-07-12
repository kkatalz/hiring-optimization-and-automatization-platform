import type { InterviewStatus } from './statuses.enum';

export interface Interview {
  id: string;
  meetLink: string;
  scheduledDate: string;
  durationMinutes: number;
  submissionId: string;
  tenantId: string;
  interviewersEmails: string[];
  candidateEmail: string;
  notes?: string;
  status: InterviewStatus;
  createdAt: string;
  updatedAt: string;
}
