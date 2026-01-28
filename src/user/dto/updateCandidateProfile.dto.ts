import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { LanguageProficiency } from '../../entities/hiring.enum';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  languages?: LanguageProficiency[];
}
