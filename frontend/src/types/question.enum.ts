export const QuestionType = {
  boolean: 'boolean',
  text: 'text',
  dropdown: 'dropdown',
} as const;

export type QuestionType = (typeof QuestionType)[keyof typeof QuestionType];

export const QUESTION_TYPES: QuestionType[] = ['boolean', 'text', 'dropdown'];
