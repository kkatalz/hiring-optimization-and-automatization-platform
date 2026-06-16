import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageProficiency } from '../../entities/hiring.enum';
import { Type } from 'class-transformer';

export class QuestionAnswerFilterEntry {
  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @IsOptional()
  value?: string | string[];
}

export class VacancySubmissionFilterDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  minYearsOfExperience?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxYearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languages?: LanguageProficiency[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerFilterEntry)
  answers?: QuestionAnswerFilterEntry[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minMatchScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalaryExpectation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalaryExpectation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxCommentAiScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  maxResumeAiScore?: number;
}
