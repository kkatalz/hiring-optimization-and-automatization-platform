import { IsNotEmpty, IsString } from 'class-validator';
import { RequiredIfDropdown } from 'src/decorators/requiredIfDropdown.decorator';
import { QuestionType } from 'src/entities/question.enum';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  type: QuestionType;

  @RequiredIfDropdown()
  answerOptions?: string[];
}

// // body for postman
// {  "label": "What is your favorite color?",
//    "type": "dropdown",
//    "answerOptions": ["Red", "Green", "Blue"]
// }
