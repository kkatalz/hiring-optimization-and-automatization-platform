import type { InterviewStatus } from './statuses.enum';

export interface CreateInterviewInput {
  submissionId: string;
  meetLink: string;
  // ISO string - the backend parses it into a Date
  scheduledDate: string;
  durationMinutes?: number;
  interviewersEmails?: string[];
  notes?: string;
}

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
