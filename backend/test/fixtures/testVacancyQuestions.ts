import { VacancyQuestion } from '../../src/entities/vacancyQuestion';
import { testVacancies } from './testVacancies';
import { testQuestions } from './testQuestions';

/**
 * testQuestions[0] (boolean "Do you have a car?") is intentionally linked to
 * BOTH vacancies to demonstrate the shared-question across vacancies feature.
 *
 * Priority/expectedValue setup for vacancy[1] (used for match score tests):
 *   [0] "Do you have a car?" — boolean, priority 1, expectedValue 'true'
 *   [1] "What is your biggest strength?" — text, no expectedValue (excluded from scoring)
 *   [2] "What is your education level?" — dropdown, priority 2, expectedValue ['Bachelor']
 */
export const testVacancyQuestions: VacancyQuestion[] = [
  {
    vacancyId: testVacancies[0].id,
    questionId: testQuestions[0].id,
    isRequired: true,
    priority: 1,
    expectedValue: 'true',
    vacancy: testVacancies[0],
    question: testQuestions[0],
  },
  {
    vacancyId: testVacancies[0].id,
    questionId: testQuestions[2].id,
    isRequired: false,
    priority: 2,
    expectedValue: ['Bachelor'],
    vacancy: testVacancies[0],
    question: testQuestions[2],
  },
  {
    // Same question as above — shared between vacancy[0] and vacancy[1]
    vacancyId: testVacancies[1].id,
    questionId: testQuestions[0].id,
    isRequired: true,
    priority: 1,
    expectedValue: 'true',
    vacancy: testVacancies[1],
    question: testQuestions[0],
  },
  {
    vacancyId: testVacancies[1].id,
    questionId: testQuestions[1].id,
    isRequired: false,
    priority: 3,
    expectedValue: undefined,
    vacancy: testVacancies[1],
    question: testQuestions[1],
  },
  {
    vacancyId: testVacancies[1].id,
    questionId: testQuestions[2].id,
    isRequired: true,
    priority: 2,
    expectedValue: ['Bachelor'],
    vacancy: testVacancies[1],
    question: testQuestions[2],
  },
];

export const EXPECTED_NUMBER_OF_VACANCIES_WITH_QUESTIONS = new Set(
  testVacancyQuestions.map((vq) => vq.vacancyId),
).size;
