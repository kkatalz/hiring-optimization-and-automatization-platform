import { Vacancy } from '../../entities/vacancy';
import { CandidateVacancyDto } from '../dto/candidateVacancy.dto';

export const vacancyToCandidateVacancyDto = (
  vacancy: Vacancy,
): CandidateVacancyDto => {
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
