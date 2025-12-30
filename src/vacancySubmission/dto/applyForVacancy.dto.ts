import { IsOptional, IsString } from 'class-validator';

export class CreateVacancySubmissionDto {
  @IsOptional()
  @IsString()
  comment: string;
}
