import {
  IsArray,
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
import { VacancyQuestionDto } from 'src/vacancy/dto/vacancyQuestion.dto';

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
  @IsString()
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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VacancyQuestionDto)
  vacancyQuestions?: VacancyQuestionDto[];
}
