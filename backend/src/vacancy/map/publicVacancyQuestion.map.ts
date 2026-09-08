import { VacancyQuestion } from '../../entities/vacancyQuestion';
import { PublicVacancyQuestionDto } from '../dto/publicVacancyQuestion.dto';

export const vacancyQuestionToPublicDto = ({
  vacancyId,
  questionId,
  isRequired,
  question,
}: VacancyQuestion): PublicVacancyQuestionDto => {
  return {
    vacancyId,
    questionId,
    isRequired,
    label: question.label,
    type: question.type,
    answerOptions: question.answerOptions,
  };
};
