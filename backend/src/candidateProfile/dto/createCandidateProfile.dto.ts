import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateLanguageProficiency } from './candidateLanguageProficiency.dto';
import { IsValidPassword } from '../../decorators/isValidPassword.decorator';
import {
  FIRST_NAME_MAX_LENGTH,
  IsValidName,
  IsValidPlaceName,
  LAST_NAME_MAX_LENGTH,
} from '../../decorators/isValidName.decorator';

export class CreateCandidateProfileDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsValidPassword()
  password: string;

  @IsValidName(FIRST_NAME_MAX_LENGTH)
  firstName: string;

  @IsValidName(LAST_NAME_MAX_LENGTH)
  lastName: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsValidPlaceName()
  country: string;

  @IsValidPlaceName()
  city: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayUnique(
    (lang: CandidateLanguageProficiency) => lang.code.toLowerCase(),
    {
      message: 'languages must not contain duplicate language codes',
    },
  )
  @ValidateNested({ each: true })
  @Type(() => CandidateLanguageProficiency)
  languages: CandidateLanguageProficiency[];

  @IsOptional()
  @IsString()
  resume?: string;
}
