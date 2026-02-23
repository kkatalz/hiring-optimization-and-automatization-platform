import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageProficiency } from '../entities/hiring.enum';
import { Type } from 'class-transformer';

export class QuestionAnswerFilterEntry {
  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsString()
  value?: string;
}

export class RecruitingFilterDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  minYearsOfExperience?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxYearsOfExperience?: number;

  @IsOptional()
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
}
