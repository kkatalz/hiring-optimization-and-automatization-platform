import { IsOptional, IsString } from 'class-validator';

export class VacancySubmissionDto {
  id: string;

  @IsOptional()
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  vacancyId: string;

  @IsOptional()
  @IsString()
  candidateId: string;

  @IsString()
  status: string;
}
