import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RequiredIfDropdown } from '../../decorators/requiredIfDropdown.decorator';
import { ConvertStringToBool } from '../../decorators/convertStringToBool.decorator';
import { QuestionType } from '../../entities/question.enum';
import { Type } from 'class-transformer';

export class UpdateVacancyQuestionInlineDto {
  @IsNotEmpty()
  @IsString()
  questionId: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  type: QuestionType;

  @RequiredIfDropdown()
  answerOptions?: string[];

  @IsNotEmpty()
  @ConvertStringToBool()
  @IsBoolean()
  isRequired: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  priority?: number;

  @IsOptional()
  expectedValue?: string | string[];
}
