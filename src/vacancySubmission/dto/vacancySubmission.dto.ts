import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CandidateProfileDto } from '../../candidateProfile/dto/candidateProfile.dto';
import { VacancySubmissionStatus } from '../../entities/statuses.enum';
import { QuestionAnswerFilterEntry } from 'src/recruiting/recruitingFilter.dto';
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
  @ValidateNested()
  @Type(() => CandidateProfileDto)
  candidateProfile?: CandidateProfileDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterEntry)
  answers?: QuestionAnswerFilterEntry[];
}
