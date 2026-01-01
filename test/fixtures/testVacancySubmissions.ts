import { VacancySubmission } from '../../src/entities/vacancySubmission';
import { testUsers } from '../fixtures/testUsers';

const VACANCY_ID = 'ced1d3f0-fe3e-4b22-9c26-54f2e5ff4b2e';

export const testVacancySubmissions: VacancySubmission[] = [
  {
    id: '0899dc13-fab7-4041-b99c-9865925588f9',
    comment: 'I want to work!',
    vacancyId: VACANCY_ID,
    candidateId: testUsers[5].id,
  },
];
