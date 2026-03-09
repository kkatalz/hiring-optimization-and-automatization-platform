import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';
import { Type } from 'class-transformer';
import { UpdateVacancyQuestionInlineDto } from './updateVacancyWithQuestions.dto';
import { CustomWeights } from '../../vacancySubmission/types/matchingScore.interface';

export class UpdateVacancyDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsEnum(TimeCommitment)
  timeCommitment?: TimeCommitment;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languageRequirements?: LanguageProficiency[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomWeights)
  customWeights?: CustomWeights;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVacancyQuestionInlineDto)
  vacancyQuestions?: UpdateVacancyQuestionInlineDto[];
}
