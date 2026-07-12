import type { SentenceScore } from './scores.interface';
import type { VacancySubmissionStatus } from './statuses.enum';
import type { Vacancy } from './vacancy';
import type { CandidateProfile } from './candidateProfile';
import type { Interview } from './interview';
import type { SubmissionAnswer } from './submissionAnswers';

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
  vacancy?: Vacancy;
  candidateProfile?: CandidateProfile;
  interviews?: Interview[];
  answers?: SubmissionAnswer[];
}
