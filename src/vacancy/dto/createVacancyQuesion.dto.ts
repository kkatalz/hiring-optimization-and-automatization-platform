import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ConvertStringToBool } from '../../decorators/convertStringToBool.decorator';
import { Type } from 'class-transformer';

export class CreateVacancyQuestionDto {
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
  @IsString()
  expectedValue?: string;
}
