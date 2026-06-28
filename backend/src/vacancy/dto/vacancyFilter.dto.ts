import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  LanguageProficiency,
  TimeCommitment,
} from '../../entities/hiring.enum';

export class VacancyFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(TimeCommitment, { each: true })
  timeCommitment?: TimeCommitment[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageProficiency)
  languageRequirements?: LanguageProficiency[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minRequiredExperience?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxRequiredExperience?: number;

  /**
   * One of createdAt, requiredYearsOfExperience, minSalary, maxSalary.
   * @example "createdAt"
   */
  @IsOptional()
  @IsString()
  sortBy?: string;

  /**
   * One of ASC, DESC.
   * @example "DESC"
   */
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  /**
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  /**
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
