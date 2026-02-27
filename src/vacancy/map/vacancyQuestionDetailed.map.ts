import { VacancyQuestion } from '../../entities/vacancyQuestion';
import { VacancyQuestionDetailedDto } from '../../vacancy/dto/vacancyQuestionDetailed.dto';

export const vacancyQuestionToDetailedDto = ({
  vacancyId,
  questionId,
  isRequired,
  priority,
  expectedValue,
  question,
}: VacancyQuestion): VacancyQuestionDetailedDto => {
  return {
    vacancyId,
    questionId,
    isRequired,
    priority: priority ?? 1,
    expectedValue,
    label: question.label,
    type: question.type,
    answerOptions: question.answerOptions,
  };
};
