import { Vacancy } from '../../entities/vacancy';
import { GeneralVacancyDto } from '../dto/generalVacancy.dto';

export const vacancyToGeneralVacancyDto = (
  vacancy: Vacancy,
): GeneralVacancyDto => {
  const {
    id,
    name,
    description,
    salary,
    timeCommitment,
    languageRequirements,
    requiredYearsOfExperience,
    tags,
    vacancyQuestions,
    createdAt,
  } = vacancy;

  return {
    id,
    name,
    description,
    salary,
    numberOfSubmissions:
      (vacancy as Vacancy & { submissionCount?: number }).submissionCount ?? 0,
    timeCommitment,
    languageRequirements,
    requiredYearsOfExperience,
    tags,
    vacancyQuestions: vacancyQuestions?.map((vq) => ({
      vacancyId: vq.vacancyId,
      questionId: vq.questionId,
      isRequired: vq.isRequired,
    })),
    createdAt,
  };
};
