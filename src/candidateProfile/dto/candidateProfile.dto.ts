import { LanguageProficiency } from '../../entities/hiring.enum';
import { UserRole } from '../../entities/role.enum';
import { VacancySubmissionStatus } from '../../entities/statuses.enum';
import { SentenceScore } from '../../sapling/types/scores.interface';

export class CandidateSubmissionDto {
  id: string;
  vacancyId: string;
  status: VacancySubmissionStatus;
  comment?: string;
  resume?: string;
  tags?: string[];
  expectedSalary?: number | null;
  createdAt: Date;
}

export class CandidateProfileDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole.candidate;
  token?: string;
  yearsOfExperience: number;
  country: string;
  city: string;
  languages: LanguageProficiency[];
  resume?: string;
  resumeAiScore?: number | null;
  resumeAiSentenceScores?: SentenceScore[] | null;
  submissions?: CandidateSubmissionDto[];
}
