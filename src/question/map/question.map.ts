import { Question } from '../../entities/question';
import { QuestionDto } from '../dto/question.dto';

export const questionToQuestionDto = (question: Question): QuestionDto => {
  return {
    id: question.id,
    tenantId: question.tenantId,
    label: question.label,
    type: question.type,
    answerOptions: question.answerOptions ?? undefined,
  };
};
