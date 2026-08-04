import type { SentenceScore } from './scores.interface';
import type { VacancySubmissionStatus } from './statuses.enum';
import type { CandidateProfile } from './candidateProfile';
import type { LanguageProficiency } from './hiring.enum';
import type { QuestionAnswer } from './question';

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

type SubmissionSortFields =
  | 'createdAt'
  | 'expectedSalary'
  | 'recruiterRating'
  | 'matchScore'
  | 'commentAiScore'
  | 'resumeAiScore';
type SubmissionSortOrder = 'ASC' | 'DESC';

export interface SubmissionSortQuery {
  sortBy?: SubmissionSortFields;
  order?: SubmissionSortOrder;
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
