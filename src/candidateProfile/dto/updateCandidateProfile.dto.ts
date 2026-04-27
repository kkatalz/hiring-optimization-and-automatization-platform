import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageProficiency } from '../../entities/hiring.enum';
import { Type } from 'class-transformer';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique((lang: LanguageProficiency) => lang.code, {
    message: 'languages must not contain duplicate language codes',
  })
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languages?: LanguageProficiency[];

  @IsOptional()
  @IsString()
  resume?: string;
}
