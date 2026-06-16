export class VacancyQuestionDto {
  vacancyId: string;
  questionId: string;
  isRequired: boolean;
  priority: number;
  expectedValue?: string | string[];
}
