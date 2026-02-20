import { QuestionType } from 'src/entities/question.enum';

export class QuestionDto {
  id: string;
  tenantId: string;
  label: string;
  type: QuestionType;
  answerOptions?: string[];
}
