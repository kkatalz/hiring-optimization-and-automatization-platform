import { Vacancy } from '../../entities/vacancy';
import { VacancyDto } from '../../vacancy/dto/vacancy.dto';

export const vacancyToVacancyDto = (vacancy: Vacancy): VacancyDto => {
  const {
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
    vacancyQuestions,
    createdAt,
  } = vacancy;

  return {
    id,
    name,
    description,
    minSalary,
    maxSalary,
    tenantId,
    createdById,
    numberOfSubmissions:
      (vacancy as Vacancy & { submissionCount?: number }).submissionCount ?? 0,
    timeCommitment,
    languageRequirements,
    requiredYearsOfExperience,
    tags,
    customWeights,
    vacancyQuestions,
    createdAt,
  };
};
