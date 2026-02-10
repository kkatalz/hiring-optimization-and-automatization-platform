import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateVacancySubmissionDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
