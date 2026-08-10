import type { SentenceScore } from './scores.interface';
import type { VacancySubmissionStatus } from './statuses.enum';
import type { CandidateProfile } from './candidateProfile';
import type { LanguageProficiency } from './hiring.enum';
import type { QuestionAnswer } from './question';
import type { SortOrder } from './common/Order';

export interface VacancySubmission {
  id: string;
  comment?: string;
  commentAiScore?: number | null;
  commentAiSentenceScores?: SentenceScore[] | null;
  resume?: string;
  resumeAiScore?: number | null;
  resumeAiSentenceScores?: SentenceScore[] | null;
  vacancyId: string;
  tenantId: string;
  candidateId: string;
  status: VacancySubmissionStatus;
  tags?: string[];
  matchScore?: number;
  createdAt: string;
  expectedSalary?: number | null;
  recruiterRating?: number | null;
  ratedByRecruiterId?: string | null;
  clusterId?: number | null;
  candidateProfile?: CandidateProfile;
  answers?: QuestionAnswer[];
}

export const SUBMISSION_SORT_FIELDS = [
  'createdAt',
  'expectedSalary',
  'recruiterRating',
  'matchScore',
  'commentAiScore',
  'resumeAiScore',
];
export type SubmissionSortColumn = (typeof SUBMISSION_SORT_FIELDS)[number];

export interface SubmissionSortQuery {
  sortBy?: SubmissionSortColumn;
  order?: SortOrder;
}

export interface SubmissionFilter {
  minYearsOfExperience?: number;
  maxYearsOfExperience?: number;
  countries?: string[];
  cities?: string[];
  languages?: LanguageProficiency[];
  answers?: QuestionAnswer[];
  minMatchScore?: number;
  minSalaryExpectation?: number;
  maxSalaryExpectation?: number;
  maxCommentAiScore?: number;
  maxResumeAiScore?: number;
}
