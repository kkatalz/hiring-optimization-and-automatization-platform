import { IsOptional, IsString } from 'class-validator';
import { RequiredIfDropdown } from '../../decorators/requiredIfDropdown.decorator';
import { QuestionType } from '../../entities/question.enum';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  type?: QuestionType;

  @RequiredIfDropdown()
  answerOptions?: string[];
}
