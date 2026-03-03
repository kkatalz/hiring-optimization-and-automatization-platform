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
  matchScore,
  createdAt,
  expectedSalary,
  recruiterRating,
  ratedByRecruiterId,
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
    matchScore: matchScore ? Number(matchScore) : 0,
    createdAt,
    expectedSalary,
    recruiterRating,
    ratedByRecruiterId,
    candidateProfile: candidateProfile
      ? candidateToCandidateProfileDto(candidateProfile)
      : undefined,
    answers,
  };
};
