import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionAnswerAllRequiredDto {
  @IsNotEmpty()
  @IsUUID()
  questionId: string;

  @IsNotEmpty()
  value: string | string[];
}

export class CreateVacancySubmissionDto {
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionAnswerAllRequiredDto)
  answers?: QuestionAnswerAllRequiredDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedSalary?: number | null;

  @IsOptional()
  @IsString()
  resume?: string;
}
