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

export class VacancySubmissionDto {
  id: string;

  @IsOptional()
  @IsString()
  comment?: string;

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
  @ValidateNested()
  @Type(() => CandidateProfileDto)
  candidateProfile?: CandidateProfileDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterEntry)
  answers?: QuestionAnswerFilterEntry[];
}
