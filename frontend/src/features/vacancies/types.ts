import type { LanguageProficiency } from '../filters/filterSlice';

export interface Vacancy {
  id: string;
  name: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  tenantId: string;
  createdById: string;
  timeCommitment?: string;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomWeights {
  questions?: number;
  tags?: number;
  languages?: number;
  experience?: number;
  salary?: number;
}

type QuestionType = 'boolean' | 'text' | 'dropdown';
export const QUESTION_TYPES: QuestionType[] = ['boolean', 'text', 'dropdown'];

export interface VacancyQuestionInput {
  label: string;
  type?: QuestionType;
  answerOptions?: string[]; // Only for 'dropdown' type
  isRequired: boolean;
  priority?: number;
  expectedValue?: string | string[];
}

export interface CreateVacancyInput {
  name: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  timeCommitment?: string;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  vacancyQuestions: VacancyQuestionInput[];
}

export type UpdateVacancyInput = Partial<CreateVacancyInput>;
