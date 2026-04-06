import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageProficiency } from '../../entities/hiring.enum';
import { Type } from 'class-transformer';

export class CandidateProfileFilterDto {
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxResumeAiScore?: number;
}
