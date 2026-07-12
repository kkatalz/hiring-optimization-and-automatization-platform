import type { Question } from './question';
import type { Vacancy } from './vacancy';

export interface VacancyQuestion {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
  priority: number;
  expectedValue?: string | string[];
  vacancy: Vacancy;
  question: Question;
}
