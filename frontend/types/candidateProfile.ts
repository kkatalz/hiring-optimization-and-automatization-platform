import type { LanguageProficiency } from './hiring.enum';
import type { UserRole } from './role.enum';
import type { VacancySubmissionStatus } from './statuses.enum';
import type { SentenceScore } from './scores.interface';

export interface CandidateSubmission {
  id: string;
  vacancyId: string;
  status: VacancySubmissionStatus;
  comment?: string;
  resume?: string;
  tags?: string[];
  expectedSalary?: number | null;
  createdAt: string;
}

export interface CandidateProfile {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token?: string;
  yearsOfExperience: number;
  country: string;
  city: string;
  languages: LanguageProficiency[];
  resume?: string;
  resumeAiScore?: number | null;
  resumeAiSentenceScores?: SentenceScore[] | null;
  submissions?: CandidateSubmission[];
}
