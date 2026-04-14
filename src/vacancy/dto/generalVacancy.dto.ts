import { LanguageProficiency, TimeCommitment } from '../../entities/hiring.enum';
import { GeneralVacancyQuestionDto } from './generalVacancyQuestion.dto';

export class GeneralVacancyDto {
  id: string;
  name: string;
  description: string;
  salary?: string;
  numberOfSubmissions?: number;
  timeCommitment?: TimeCommitment;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  vacancyQuestions?: GeneralVacancyQuestionDto[];
  createdAt?: Date;
}
