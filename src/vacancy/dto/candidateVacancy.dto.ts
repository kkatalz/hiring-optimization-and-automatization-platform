import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';
import { Type } from 'class-transformer';
import { CandidateVacancyQuestionDto } from './candidateVacancyQuestion.dto';

export class CandidateVacancyDto {
  id: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsNumber()
  @IsOptional()
  numberOfSubmissions?: number;

  @IsOptional()
  @IsEnum(TimeCommitment)
  timeCommitment?: TimeCommitment;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languageRequirements?: LanguageProficiency[];

  @IsOptional()
  @IsInt()
  requiredYearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CandidateVacancyQuestionDto)
  vacancyQuestions?: CandidateVacancyQuestionDto[];

  @IsOptional()
  createdAt?: Date;
}
