import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
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
}
