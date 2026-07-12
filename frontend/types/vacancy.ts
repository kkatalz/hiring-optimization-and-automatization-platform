import type { VacancySubmission } from './vacancySubmission';

export interface Vacancy {
  id: string;
  name: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  tenantId: string;
  createdById: string;
  submissions?: VacancySubmission[];
  timeCommitment?: TimeCommitment;
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

export type SortColumn =
  | 'createdAt'
  | 'requiredYearsOfExperience'
  | 'minSalary'
  | 'maxSalary';

export type SortOrder = 'ASC' | 'DESC';

export type TimeCommitment = 'FULL_TIME' | 'PART_TIME' | 'PROJECT_BASED';
export const ALL_TIME_COMMITMENTS: TimeCommitment[] = [
  'FULL_TIME',
  'PART_TIME',
  'PROJECT_BASED',
];

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'NATIVE';
export const ALL_LANGUAGE_LEVELS: LanguageLevel[] = [
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2',
  'NATIVE',
];

export interface LanguageProficiency {
  code: string;
  level: LanguageLevel;
}

export interface VacanciesFilters {
  name?: string;
  timeCommitment?: TimeCommitment[];
  languageRequirements?: LanguageProficiency[];
  minSalary?: number;
  maxSalary?: number;
  tags?: string[];
  minRequiredExperience?: number;
  maxRequiredExperience?: number;
  sortBy?: SortColumn;
  order?: SortOrder;
  page?: number;
  limit?: number;
}

export const initialState: VacanciesFilters = {
  name: '',
  timeCommitment: [],
  languageRequirements: [],
  minSalary: undefined,
  maxSalary: undefined,
  tags: [],
  minRequiredExperience: undefined,
  maxRequiredExperience: undefined,
  sortBy: undefined,
  order: undefined,
  page: 1,
  limit: 10,
};

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
  timeCommitment?: TimeCommitment;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  vacancyQuestions: VacancyQuestionInput[];
}

export type UpdateVacancyInput = Partial<CreateVacancyInput>;
