export interface Vacancy {
  id: string;
  name: string;
  description: string;
  minSalary?: number | null;
  maxSalary?: number | null;
  tenantId: string;
  createdById: string;
  requiredYearsOfExperience?: number;
  tags?: string[];
  createdAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateVacancyInput {
  name: string;
  description: string;
  minSalary?: number;
  maxSalary?: number;
  requiredYearsOfExperience?: number;
  tags?: string[];
}

export type UpdateVacancyInput = Partial<CreateVacancyInput>;
