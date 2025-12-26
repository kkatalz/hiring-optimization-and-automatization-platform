import { VacancySubmission } from 'src/entities/vacancySubmission';
import { VacancySubmissionDto } from 'src/vacancySubmission/dto/vacancySubmission.dto';

export const vacancySubmToVacancySubmDto = ({
  id,
  comment,
  vacancyId,
  candidateId,
}: VacancySubmission): VacancySubmissionDto => {
  return {
    id,
    comment,
    vacancyId,
    candidateId,
  };
};
