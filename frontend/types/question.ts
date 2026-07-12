import type { QuestionType } from './question.enum';
import type { VacancyQuestion } from './vacancyQuestion';
import type { SubmissionAnswer } from './submissionAnswers';
import type { Tenant } from './tenant';

export interface Question {
  id: string;
  tenantId: string;
  label: string;
  type: QuestionType;
  answerOptions?: string[];
  vacancyQuestions: VacancyQuestion[];
  answers?: SubmissionAnswer[];
  tenant: Tenant;
}
