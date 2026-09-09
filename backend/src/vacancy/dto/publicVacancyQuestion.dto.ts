import { QuestionType } from '../../entities/question.enum';

export class PublicVacancyQuestionDto {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
  label: string;
  type: QuestionType;
  answerOptions?: string[] | null;
}
