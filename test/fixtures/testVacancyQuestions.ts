import { VacancyQuestion } from '../../src/entities/vacancyQuestion';
import { testVacancies } from './testVacancies';
import { testQuestions } from './testQuestions';

/**
 * testQuestions[0] (boolean "Do you have a car?") is intentionally linked to
 * BOTH vacancies to demonstrate the shared-question across vacancies feature.
 */
export const testVacancyQuestions: VacancyQuestion[] = [
  {
    vacancyId: testVacancies[0].id,
    questionId: testQuestions[0].id,
    isRequired: true,
    vacancy: testVacancies[0],
    question: testQuestions[0],
  },
  {
    vacancyId: testVacancies[0].id,
    questionId: testQuestions[2].id,
    isRequired: false,
    vacancy: testVacancies[0],
    question: testQuestions[2],
  },
  {
    // Same question as above — shared between vacancy[0] and vacancy[1]
    vacancyId: testVacancies[1].id,
    questionId: testQuestions[0].id,
    isRequired: true,
    vacancy: testVacancies[1],
    question: testQuestions[0],
  },
  {
    vacancyId: testVacancies[1].id,
    questionId: testQuestions[1].id,
    isRequired: false,
    vacancy: testVacancies[1],
    question: testQuestions[1],
  },
];
