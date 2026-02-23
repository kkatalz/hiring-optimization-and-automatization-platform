import { QuestionType } from '../../entities/question.enum';

export class VacancyQuestionDetailedDto {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
  label: string;
  type: QuestionType;
  answerOptions?: string[] | null;
}
