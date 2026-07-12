import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';
import { VacancyQuestionDto } from './vacancyQuestion.dto';
import { CustomWeights } from '../../vacancySubmission/types/matchingScore.interface';

export class VacancyDto {
  id: string;
  name: string;
  description: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  tenantId: string;
  createdById: string;
  numberOfSubmissions?: number;
  timeCommitment?: TimeCommitment;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  vacancyQuestions?: VacancyQuestionDto[];
  createdAt?: Date;
}
