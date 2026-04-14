import { VacancySubmission } from '../../entities/vacancySubmission';
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
  salary?: string;
  tenantId: string;
  createdById: string;
  submissions?: VacancySubmission[];
  timeCommitment?: TimeCommitment;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  vacancyQuestions?: VacancyQuestionDto[];
  createdAt?: Date;
}
