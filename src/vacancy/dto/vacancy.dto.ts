import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VacancySubmission } from '../../entities/vacancySubmission';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';

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
  languageRequirements?: LanguageProficiency[];
}
