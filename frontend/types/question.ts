import type { QuestionType } from './question.enum';

export interface Question {
  id: string;
  tenantId: string;
  label: string;
  type: QuestionType;
  answerOptions?: string[];
}
