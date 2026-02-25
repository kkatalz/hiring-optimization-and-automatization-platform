import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { RequiredIfDropdown } from '../../decorators/requiredIfDropdown.decorator';
import { ConvertStringToBool } from '../../decorators/convertStringToBool.decorator';
import { QuestionType } from '../../entities/question.enum';

export class CreateVacancyQuestionInlineDto {
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
}
