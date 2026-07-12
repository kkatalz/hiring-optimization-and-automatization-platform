import type { LanguageProficiency } from './hiring.enum';

export interface CustomWeights {
  questions?: number;
  tags?: number;
  languages?: number;
  experience?: number;
  salary?: number;
}

export interface ScoreResult {
  dimension: string;
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
  vacancyMinSalary?: number | null;
  vacancyMaxSalary?: number | null;
  submissionTags?: string[];
  expectedSalary?: number | null;
  customWeights?: CustomWeights;
}
