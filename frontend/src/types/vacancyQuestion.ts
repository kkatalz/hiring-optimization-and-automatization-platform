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

/**
 * A screening question as a candidate sees it while applying.
 *
 * Carries no `priority` or `expectedValue`: those are the recruiter's scoring
 * rules, and the public endpoint does not return them.
 */
export interface PublicVacancyQuestion {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
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

export interface CreateVacancyQuestionInput {
  isRequired: boolean;
  priority?: number; // the backend defaults it to 1
  expectedValue?: string | string[];
}
