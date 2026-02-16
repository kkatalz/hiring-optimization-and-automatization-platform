import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CandidateProfileDto } from '../../candidateProfile/candidate-profile/dto/candidateProfile.dto';
import { VacancySubmissionStatus } from '../../entities/statuses.enum';

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

  candidateProfile?: CandidateProfileDto;
}
