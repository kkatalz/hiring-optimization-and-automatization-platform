import { VacancySubmission } from 'src/entities/vacancySubmission';

export class VacancyDto {
  id: string;
  name: string;
  description: string;
  salary?: string;
  tenantId: string;
  createdById: string;
  submissions?: VacancySubmission[];
}
