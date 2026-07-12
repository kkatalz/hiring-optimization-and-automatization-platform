import type { QuestionType } from './question.enum';

export interface VacancyQuestion {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
  priority: number;
  expectedValue?: string | string[];
}

export interface VacancyQuestionDetailed extends VacancyQuestion {
  label: string;
  type: QuestionType;
  answerOptions?: string[] | null;
}
