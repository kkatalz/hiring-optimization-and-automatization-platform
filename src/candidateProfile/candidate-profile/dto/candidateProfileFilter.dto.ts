import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { LanguageProficiency } from '../../../entities/hiring.enum';
import { Transform, Type } from 'class-transformer';
import { stringToArray } from '../../../utils/convertStringToArray';

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
  @IsString({ each: true })
  countries?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @Transform(stringToArray)
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languages?: LanguageProficiency[];
}
