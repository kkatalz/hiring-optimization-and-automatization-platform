import { VacancyQuestion } from '../../entities/vacancyQuestion';
import { VacancyQuestionDto } from '../dto/vacancyQuestion.dto';

export const vacancyQuestionToDto = (
  vq: VacancyQuestion,
): VacancyQuestionDto => {
  return {
    vacancyId: vq.vacancyId,
    questionId: vq.questionId,
    isRequired: vq.isRequired,
    priority: vq.priority ?? 1,
    expectedValue: vq.expectedValue,
  };
};
