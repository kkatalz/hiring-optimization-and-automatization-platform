import { VacancySubmission } from '../../entities/vacancySubmission';
import { LanguageProficiency } from '../../entities/hiring.enum';
import { UserRole } from '../../entities/role.enum';
import { SentenceScore } from '../../sapling/sapling.service';

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
  submissions?: VacancySubmission[];
}
