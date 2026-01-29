import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { LanguageLevel } from '../../../entities/hiring.enum';
import { Transform } from 'class-transformer';
import { toStringArray } from '../../../utils/convertToStringArray';

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
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @IsString({ each: true })
  languageCodes?: string[];

  @IsOptional()
  @IsEnum(LanguageLevel)
  minLanguageLevel?: LanguageLevel;
}
