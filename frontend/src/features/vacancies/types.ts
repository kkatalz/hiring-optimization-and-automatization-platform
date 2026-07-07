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
}

export type UpdateVacancyInput = Partial<CreateVacancyInput>;
