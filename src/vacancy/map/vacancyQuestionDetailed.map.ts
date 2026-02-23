import { VacancyQuestion } from '../../entities/vacancyQuestion';
import { VacancyQuestionDetailedDto } from '../../vacancy/dto/vacancyQuestionDetailed.dto';

export const vacancyQuestionToDetailedDto = ({
  vacancyId,
  questionId,
  isRequired,
  question,
}: VacancyQuestion): VacancyQuestionDetailedDto => {
  return {
    vacancyId,
    questionId,
    isRequired,
    label: question.label,
    type: question.type,
    answerOptions: question.answerOptions,
  };
};
