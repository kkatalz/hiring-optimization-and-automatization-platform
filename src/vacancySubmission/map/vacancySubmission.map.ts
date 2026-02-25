import { VacancySubmission } from '../../entities/vacancySubmission';
import { VacancySubmissionDto } from '../../vacancySubmission/dto/vacancySubmission.dto';
import { candidateToCandidateProfileDto } from '../../candidateProfile/map/candidate.map';

export const vacancySubmToVacancySubmDto = ({
  id,
  comment,
  vacancyId,
  tenantId,
  candidateId,
  status,
  tags,
  candidateProfile,
  answers,
}: VacancySubmission): VacancySubmissionDto => {
  return {
    id,
    comment,
    vacancyId,
    tenantId,
    candidateId,
    status,
    tags,
    candidateProfile: candidateProfile
      ? candidateToCandidateProfileDto(candidateProfile)
      : undefined,
    answers,
  };
};
