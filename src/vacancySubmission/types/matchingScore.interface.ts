import { LanguageProficiency } from '../../entities/hiring.enum';

export interface ScoreResult {
  ratio: number;
  weight: number;
  bonus: number;
  log: string;
}

export interface MatchScoreOptions {
  candidateLanguages?: LanguageProficiency[];
  candidateYearsOfExperience?: number;
  vacancyLanguageRequirements?: LanguageProficiency[];
  vacancyRequiredYearsOfExperience?: number;
  vacancyTags?: string[];
  vacancySalary?: string;
  submissionTags?: string[];
  expectedSalary?: number | null;
}
