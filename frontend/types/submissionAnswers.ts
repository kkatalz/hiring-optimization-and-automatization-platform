import type { Question } from './question';
import type { VacancySubmission } from './vacancySubmission';

export interface SubmissionAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  value: string | string[];
  submission: VacancySubmission;
  question: Question;
}
