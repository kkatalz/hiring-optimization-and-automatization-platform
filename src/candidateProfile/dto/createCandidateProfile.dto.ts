import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateLanguageProficiency } from './candidateLanguageProficiency.dto';

export class CreateCandidateProfileDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  yearsOfExperience: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  country: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
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
