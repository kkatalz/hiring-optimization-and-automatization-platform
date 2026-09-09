import { useHasPermission } from '@/features/auth/model/useHasPermission';
import { useGetMyCandidateProfileQuery } from '@/features/profile/api/profileEndpoints';
import type { CandidateSubmission } from '@/types';

interface MyVacancySubmission {
  submission?: CandidateSubmission;
  hasApplied: boolean;
  isCandidate: boolean;
  isLoading: boolean;
}

/**
 * The viewer's own application to one vacancy.
 *
 * There is no endpoint for a single application, so this leans on the
 * candidate's profile, which carries all of them. Every caller shares one RTK
 * Query cache entry, so asking from several places on the same screen costs
 * one request.
 */
export const useMyVacancySubmission = (
  vacancyId: string,
): MyVacancySubmission => {
  const can = useHasPermission();
  const isCandidate = can('candidateProfile:getMine');

  const { data: candidateProfile, isLoading } = useGetMyCandidateProfileQuery(
    undefined,
    { skip: !isCandidate },
  );

  const submission = candidateProfile?.submissions?.find(
    (candidateSubmission) => candidateSubmission.vacancyId === vacancyId,
  );

  return {
    submission,
    hasApplied: submission !== undefined,
    isCandidate,
    isLoading: isCandidate && isLoading,
  };
};
