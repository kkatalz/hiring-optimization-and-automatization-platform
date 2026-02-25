import { SubmissionAnswer } from '../../src/entities/submissionAnswers';
import { testQuestions } from './testQuestions';
import { testVacancySubmissions } from './testVacancySubmissions';

/**
 * Answers for testVacancySubmissions[0], which belongs to vacancy[1].
 * vacancy[1] is linked to testQuestions[0] (boolean) and testQuestions[1] (text)
 * via testVacancyQuestions, so only those two questions are answered here.
 */
export const testSubmissionAnswers: SubmissionAnswer[] = [
  {
    id: 'b0000000-bbbb-bbbb-bbbb-000000000001',
    submissionId: testVacancySubmissions[0].id,
    questionId: testQuestions[0].id,
    value: 'true',
    submission: testVacancySubmissions[0],
    question: testQuestions[0],
  },
  {
    id: 'b0000000-bbbb-bbbb-bbbb-000000000002',
    submissionId: testVacancySubmissions[0].id,
    questionId: testQuestions[1].id,
    value: 'I am very dedicated and detail-oriented.',
    submission: testVacancySubmissions[0],
    question: testQuestions[1],
  },
];
