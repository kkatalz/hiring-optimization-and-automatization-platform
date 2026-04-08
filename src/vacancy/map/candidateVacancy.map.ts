import { Vacancy } from '../../entities/vacancy';
import { CandidateVacancyDto } from '../dto/candidateVacancy.dto';

export const vacancyToCandidateVacancyDto = ({
  id,
  name,
  description,
  salary,
  submissions,
  timeCommitment,
  languageRequirements,
  requiredYearsOfExperience,
  tags,
  vacancyQuestions,
  createdAt,
}: Vacancy): CandidateVacancyDto => {
  return {
    id,
    name,
    description,
    salary,
    numberOfSubmissions: submissions?.length,
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
