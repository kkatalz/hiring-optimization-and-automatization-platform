import { IsNumber, IsOptional, Min } from 'class-validator';
import { LanguageProficiency } from '../../entities/hiring.enum';

export class CustomWeights {
  @IsOptional()
  @IsNumber()
  @Min(0)
  questions?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  tags?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  languages?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  experience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
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
