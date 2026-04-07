import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
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
  expectedSalary?: number;

  @IsOptional()
  @IsString()
  resume?: string;
}
