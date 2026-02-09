import { Vacancy } from '../../entities/vacancy';
import { VacancyDto } from '../../vacancy/dto/vacancy.dto';

export const vacancyToVacancyDto = ({
  id,
  name,
  description,
  salary,
  tenantId,
  createdById,
  timeCommitment,
  languageRequirements,
  tags,
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
    timeCommitment,
    languageRequirements,
    tags,
  };
};
