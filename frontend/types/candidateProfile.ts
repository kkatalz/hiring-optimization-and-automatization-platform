import type { LanguageProficiency } from './hiring.enum';
import type { SentenceScore } from './scores.interface';
import type { User } from './user';
import type { VacancySubmission } from './vacancySubmission';

export interface CandidateProfile {
  id: string;
  yearsOfExperience: number;
  country: string;
  city: string;
  languages: LanguageProficiency[];
  resume?: string;
  resumeAiScore?: number | null;
  resumeAiSentenceScores?: SentenceScore[] | null;
  userId?: string;
  user: User;
  submissions?: VacancySubmission[];
}
