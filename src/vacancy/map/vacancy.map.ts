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
  requiredYearsOfExperience,
  tags,
  customWeights,
  submissions,
  vacancyQuestions,
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
    requiredYearsOfExperience,
    tags,
    customWeights,
    vacancyQuestions,
  };
};
