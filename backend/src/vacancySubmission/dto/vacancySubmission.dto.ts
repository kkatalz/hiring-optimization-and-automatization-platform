import { CandidateProfileDto } from '../../candidateProfile/dto/candidateProfile.dto';
import { VacancySubmissionStatus } from '../../entities/statuses.enum';
import { QuestionAnswerFilterEntry } from './vacancySubmissionFilter.dto';
import { SentenceScore } from '../../sapling/types/scores.interface';

export class VacancySubmissionDto {
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
  createdAt: Date;
  expectedSalary?: number | null;
  recruiterRating?: number | null;
  ratedByRecruiterId?: string | null;
  clusterId?: number | null;
  candidateProfile?: CandidateProfileDto;
  answers?: QuestionAnswerFilterEntry[];
}
