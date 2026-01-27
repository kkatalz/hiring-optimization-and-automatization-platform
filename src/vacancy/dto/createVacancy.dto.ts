import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';

export class CreateVacancyDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
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
