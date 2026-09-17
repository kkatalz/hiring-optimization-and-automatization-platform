import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateLanguageProficiency } from './candidateLanguageProficiency.dto';
import {
  FIRST_NAME_MAX_LENGTH,
  IsValidName,
  IsValidPlaceName,
  LAST_NAME_MAX_LENGTH,
} from '../../decorators/isValidName.decorator';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsValidName(FIRST_NAME_MAX_LENGTH)
  firstName?: string;

  @IsOptional()
  @IsValidName(LAST_NAME_MAX_LENGTH)
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsValidPlaceName()
  country?: string;

  @IsOptional()
  @IsValidPlaceName()
  city?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique(
    (lang: CandidateLanguageProficiency) => lang.code.toLowerCase(),
    {
      message: 'languages must not contain duplicate language codes',
    },
  )
  @ValidateNested({ each: true })
  @Type(() => CandidateLanguageProficiency)
  languages?: CandidateLanguageProficiency[];

  @IsOptional()
  @IsString()
  resume?: string;
}
