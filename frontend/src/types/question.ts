import { QuestionType } from './question.enum';

export interface Question {
  id: string;
  tenantId: string;
  label: string;
  type: QuestionType;
  answerOptions?: string[];
}

/** Question belongs to a specific submission */
export interface QuestionAnswer {
  questionId: string;
  value?: string | string[];
}

export interface CreateQuestionInput {
  label: string;
  type: QuestionType;
  answerOptions?: string[];
}

export const EMPTY_QUESTION_FORM: CreateQuestionInput = {
  label: '',
  type: QuestionType.text,
  answerOptions: [],
};
