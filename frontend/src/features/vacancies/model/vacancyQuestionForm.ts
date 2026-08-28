import type { VacancyQuestionInput } from '@/types';

/**
 * Shared form logic used by both: the vacancy form
 * (many questions can be added) and the "add question to vacancy" dialog (one question can be added).
 */

export const EMPTY_VACANCY_QUESTION: VacancyQuestionInput = {
  label: '',
  priority: undefined,
  answerOptions: [],
  expectedValue: '',
  isRequired: false,
};

export const expectedValueToString = (
  expectedValue: VacancyQuestionInput['expectedValue'],
): string =>
  Array.isArray(expectedValue)
    ? expectedValue.join(', ')
    : (expectedValue ?? '');

// Dropdowns can expect several accepted options, entered comma-separated.
export const splitExpectedValues = (text: string): string[] =>
  text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean); // drop the empty ones

export const normalizeExpectedValue = (
  question: VacancyQuestionInput,
): VacancyQuestionInput => {
  const text = expectedValueToString(question.expectedValue).trim();

  if (!text) return { ...question, expectedValue: undefined };

  if (question.type !== 'dropdown') return { ...question, expectedValue: text };

  // Drop anything no longer offered, e.g. an option removed after being picked.
  const answerOptions = question.answerOptions ?? [];
  const selected = splitExpectedValues(text).filter((expected) =>
    answerOptions.includes(expected),
  );

  return {
    ...question,
    expectedValue: selected.length > 0 ? selected : undefined,
  };
};

export const validateVacancyQuestion = (
  question: VacancyQuestionInput,
): string | null => {
  if (!question.label?.trim())
    return 'No question was added. Please provide a question label.';

  if (!question.type) return 'Please select a question type.';

  if (
    question.type === 'dropdown' &&
    (question.answerOptions ?? []).length === 0
  )
    return 'Dropdown questions require at least one answer option.';

  return null;
};
