import { IsArray, IsOptional, IsString } from 'class-validator';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';

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
  @IsString()
  timeCommitment?: TimeCommitment;

  @IsOptional()
  @IsArray()
  languageRequirements?: LanguageProficiency[];
}
