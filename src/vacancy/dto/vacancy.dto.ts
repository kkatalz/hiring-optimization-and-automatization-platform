import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { VacancySubmission } from '../../entities/vacancySubmission';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';
import { Type } from 'class-transformer';
import { VacancyQuestionDto } from './vacancyQuestion.dto';
import { CustomWeights } from '../../vacancySubmission/types/matchingScore.interface';

export class VacancyDto {
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  salary?: string;

  @IsNotEmpty()
  @IsString()
  tenantId: string;

  @IsNotEmpty()
  @IsString()
  createdById: string;

  @IsOptional()
  @IsArray()
  submissions?: VacancySubmission[];

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
  customWeights?: CustomWeights;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacancyQuestionDto)
  vacancyQuestions?: VacancyQuestionDto[];
}
