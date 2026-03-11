import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CandidateProfileDto } from '../../candidateProfile/dto/candidateProfile.dto';
import { VacancySubmissionStatus } from '../../entities/statuses.enum';
import { QuestionAnswerFilterEntry } from '../../recruiting/recruitingFilter.dto';
import { Type } from 'class-transformer';
import { SentenceScore } from '../../sapling/types/scores.interface';

export class VacancySubmissionDto {
  id: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  commentAiScore?: number | null;

  @IsOptional()
  commentAiSentenceScores?: SentenceScore[] | null;

  @IsOptional()
  @IsString()
  resume?: string;

  @IsOptional()
  @IsNumber()
  resumeAiScore?: number | null;

  @IsOptional()
  resumeAiSentenceScores?: SentenceScore[] | null;

  @IsOptional()
  @IsString()
  vacancyId: string;

  @IsOptional()
  @IsString()
  tenantId: string;

  @IsOptional()
  @IsString()
  candidateId: string;

  @IsEnum(VacancySubmissionStatus)
  status: VacancySubmissionStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  matchScore?: number;

  createdAt: Date;

  @IsOptional()
  @IsNumber()
  expectedSalary?: number | null;

  @IsOptional()
  @IsInt()
  recruiterRating?: number | null;

  @IsOptional()
  @IsString()
  ratedByRecruiterId?: string | null;

  @IsOptional()
  @IsInt()
  clusterId?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => CandidateProfileDto)
  candidateProfile?: CandidateProfileDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterEntry)
  answers?: QuestionAnswerFilterEntry[];
}
