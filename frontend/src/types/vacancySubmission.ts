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
  rating?: number | null;
  ratedById?: string | null;
  clusterId?: number | null;
  candidateProfile?: CandidateProfile;
  answers?: QuestionAnswer[];
}

/** What a candidate sends when applying to a vacancy. */
export interface CreateSubmissionInput {
  comment?: string;
  tags?: string[];
  answers?: QuestionAnswer[];
  expectedSalary?: number;
  resume?: string;
}

export const SUBMISSION_SORT_FIELDS = [
  'createdAt',
  'expectedSalary',
  'rating',
  'matchScore',
  'commentAiScore',
  'resumeAiScore',
] as const;
export type SubmissionSortColumn = (typeof SUBMISSION_SORT_FIELDS)[number];

export interface SubmissionSortQuery {
  sortBy?: SubmissionSortColumn;
  order?: SortOrder;
}

export interface SubmissionFilters {
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
  status?: VacancySubmissionStatus;
}

export const submissionInitialState: SubmissionFilters & SubmissionSortQuery = {
  minYearsOfExperience: undefined,
  maxYearsOfExperience: undefined,
  countries: [],
  cities: [],
  languages: [],
  answers: [],
  minMatchScore: undefined,
  minSalaryExpectation: undefined,
  maxSalaryExpectation: undefined,
  maxCommentAiScore: undefined,
  maxResumeAiScore: undefined,
  status: undefined,
  sortBy: undefined,
  order: undefined,
};
