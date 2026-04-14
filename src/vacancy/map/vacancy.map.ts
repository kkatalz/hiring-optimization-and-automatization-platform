import { Vacancy } from '../../entities/vacancy';
import { VacancyDto } from '../../vacancy/dto/vacancy.dto';

export const vacancyToVacancyDto = ({
  id,
  name,
  description,
  minSalary,
  maxSalary,
  tenantId,
  createdById,
  timeCommitment,
  languageRequirements,
  requiredYearsOfExperience,
  tags,
  customWeights,
  submissions,
  vacancyQuestions,
  createdAt,
}: Vacancy): VacancyDto => {
  return {
    id,
    name,
    description,
    minSalary,
    maxSalary,
    tenantId,
    createdById,
    submissions,
    timeCommitment,
    languageRequirements,
    requiredYearsOfExperience,
    tags,
    customWeights,
    vacancyQuestions,
    createdAt,
  };
};
