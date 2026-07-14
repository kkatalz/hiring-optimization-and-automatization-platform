import type { LanguageProficiency, TimeCommitment } from './hiring.enum';
import type { CustomWeights } from './matchingScore';
import type { VacancyQuestion, VacancyQuestionInput } from './vacancyQuestion';

export interface Vacancy {
  id: string;
  name: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  tenantId: string;
  createdById: string;
  numberOfSubmissions?: number;
  timeCommitment?: TimeCommitment;
  languageRequirements?: LanguageProficiency[];
  requiredYearsOfExperience?: number;
  tags?: string[];
  customWeights?: CustomWeights;
  vacancyQuestions?: VacancyQuestion[];
  createdAt?: string;
}

/* Frontend-specific vacancy DTOs, filters and helpers */
export type SortColumn =
  | 'createdAt'
  | 'requiredYearsOfExperience'
  | 'minSalary'
  | 'maxSalary';

export type SortOrder = 'ASC' | 'DESC';

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
