import { VacancySubmission } from '../../entities/vacancySubmission';
import { VacancySubmissionDto } from '../../vacancySubmission/dto/vacancySubmission.dto';

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
