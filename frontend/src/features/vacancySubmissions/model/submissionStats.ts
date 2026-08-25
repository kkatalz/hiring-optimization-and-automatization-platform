import { VacancySubmissionStatus, type VacancySubmission } from '@/types';

export interface SubmissionStats {
  pending: number;
  interviewing: number;
  /** How many distinct clusters the submissions were split into. */
  clusters: number;
}

const countByStatus = (
  submissions: VacancySubmission[],
  status: VacancySubmissionStatus,
) => submissions.filter((s) => s.status.toLowerCase() === status).length;

/** Counts the numbers shown on the vacancy's stat cards. */
export const getSubmissionStats = (
  submissions: VacancySubmission[] = [],
): SubmissionStats => {
  const clusterIds = submissions
    .map((s) => s.clusterId)
    .filter((clusterId) => clusterId !== null && clusterId !== undefined);

  return {
    pending: countByStatus(submissions, VacancySubmissionStatus.pending),
    interviewing: countByStatus(
      submissions,
      VacancySubmissionStatus.interviewing,
    ),
    clusters: new Set(clusterIds).size,
  };
};
