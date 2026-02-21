import { IsNotEmpty, IsString } from 'class-validator';
import { RequiredIfDropdown } from '../../decorators/requiredIfDropdown.decorator';
import { QuestionType } from '../../entities/question.enum';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  type: QuestionType;

  @RequiredIfDropdown()
  answerOptions?: string[];
}
