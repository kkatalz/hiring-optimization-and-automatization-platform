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

export interface VacancyQuestionInput {
  questionId?: string; // present for existing questions, omitted for newly added ones
  label: string;
  type?: QuestionType;
  answerOptions?: string[]; // Only for 'dropdown' type
  isRequired: boolean;
  priority?: number;
  expectedValue?: string | string[];
}

export const VacancyQuestionDetailedToQuestionInput = (
  q: VacancyQuestionDetailed,
): VacancyQuestionInput => ({
  questionId: q.questionId,
  label: q.label,
  type: q.type,
  answerOptions: q.answerOptions ?? undefined,
  isRequired: q.isRequired,
  priority: q.priority,
  expectedValue: q.expectedValue,
});
