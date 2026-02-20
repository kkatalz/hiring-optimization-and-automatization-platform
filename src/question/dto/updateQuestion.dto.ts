import { IsOptional, IsString } from 'class-validator';
import { RequiredIfDropdown } from 'src/decorators/requiredIfDropdown.decorator';
import { QuestionType } from 'src/entities/question.enum';

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  label: string;

  @IsOptional()
  type: QuestionType;

  @RequiredIfDropdown()
  answerOptions: string[];
}
