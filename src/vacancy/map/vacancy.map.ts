import { Vacancy } from 'src/entities/vacancy';
import { VacancyDto } from 'src/vacancy/dto/vacancy.dto';

export const vacancyToVacancyDto = ({
  id,
  name,
  description,
  salary,
  tenantId,
  createdById,
  submissions,
}: Vacancy): VacancyDto => {
  return {
    id,
    name,
    description,
    salary,
    tenantId,
    createdById,
    submissions,
  };
};
