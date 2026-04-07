import {
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
import { LanguageProficiency } from '../../entities/hiring.enum';
import { Type } from 'class-transformer';

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
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languages?: LanguageProficiency[];

  @IsOptional()
  @IsString()
  resume?: string;
}
