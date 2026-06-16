import { InterviewStatus } from '../../entities/statuses.enum';

export class InterviewViewDto {
  id: string;
  meetLink: string;
  scheduledDate: Date;
  durationMinutes: number;
  submissionId: string;
  tenantId: string;
  interviewersEmails: string[];
  candidateEmail: string;
  notes?: string;
  status: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
}
