import { testCandidatesProfiles } from './testCandidatesProfiles';
import { VacancySubmission } from '../../src/entities/vacancySubmission';
import { testVacancies } from './testVacancies';
import { submissionSeeds } from './shared/submissionSeeds';

export const testVacancySubmissions: VacancySubmission[] = [
  {
    ...submissionSeeds[0],
    vacancy: testVacancies[1],
    candidateProfile: testCandidatesProfiles[1],
  },
];

export const EXPECTED_VACANCY_SUBMISSIONS_NUM = testVacancySubmissions.length;
