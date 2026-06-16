import { VacancySubmission } from '../../entities/vacancySubmission';
import { VacancySubmissionDto } from '../../vacancySubmission/dto/vacancySubmission.dto';
import { candidateToCandidateProfileDto } from '../../candidateProfile/map/candidate.map';
import { QuestionAnswerFilterEntry } from '../dto/vacancySubmissionFilter.dto';

export const vacancySubmToVacancySubmDto = ({
  id,
  comment,
  commentAiScore,
  commentAiSentenceScores,
  resume,
  resumeAiScore,
  resumeAiSentenceScores,
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
  clusterId,
  candidateProfile,
  answers,
}: VacancySubmission): VacancySubmissionDto => {
  const answerEntries: QuestionAnswerFilterEntry[] | undefined = answers?.map(
    ({ questionId, value }) => ({ questionId, value }),
  );

  return {
    id,
    comment,
    commentAiScore: commentAiScore ?? null,
    commentAiSentenceScores: commentAiSentenceScores ?? null,
    resume,
    resumeAiScore: resumeAiScore ?? null,
    resumeAiSentenceScores: resumeAiSentenceScores ?? null,
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
    clusterId,
    candidateProfile: candidateProfile
      ? candidateToCandidateProfileDto(candidateProfile)
      : undefined,
    answers: answerEntries,
  };
};
