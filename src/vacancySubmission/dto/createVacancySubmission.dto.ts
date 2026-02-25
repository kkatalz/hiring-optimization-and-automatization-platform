import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionAnswerFilterEntry } from '../../recruiting/recruitingFilter.dto';
import { Type } from 'class-transformer';

export class CreateVacancySubmissionDto {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterEntry)
  answers?: QuestionAnswerFilterEntry[];
}
